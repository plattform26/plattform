import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { sendInstructorApprovalEmail } from '@/lib/mail';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    console.log("🔍 [ADMIN_API] Iniciando búsqueda para ID:", params.id);

    const user = await prisma.user.findUnique({
      where: { id: params.id }
    });

    if (!user) {
      console.log("❌ [ADMIN_API] El usuario no existe en la DB");
      return new NextResponse("Usuario no encontrado", { status: 404 });
    }

    console.log("✅ [ADMIN_API] Usuario base encontrado:", user.email);

    const instructorProfile = await prisma.instructorProfile.findUnique({
      where: { userId: params.id }
    });

    console.log("📝 [ADMIN_API] Perfil de instructor", instructorProfile ? "ENCONTRADO" : "NO EXISTENTE");

    const cleanUser = {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      specialty: instructorProfile?.specialty || '', // Ahora se lee desde el perfil
      createdAt: user.createdAt.toISOString(),
      instructorProfile: instructorProfile ? {
        id: instructorProfile.id,
        academyName: instructorProfile.academyName,
        slug: instructorProfile.slug,
        description: instructorProfile.description || '',
        institution: instructorProfile.institution || '',
        logoUrl: instructorProfile.logoUrl || '',
        linkedinUrl: instructorProfile.linkedinUrl || '',
        specialty: instructorProfile.specialty || '', // Consistente con la nueva ubicación
        commissionRate: instructorProfile.commissionRate ? Number(instructorProfile.commissionRate) : 15.00
      } : null
    };

    return NextResponse.json(cleanUser);

  } catch (error: any) {
    console.error("🔥 [ADMIN_API_CRASH] Error real detectado:", error.message);
    console.error("📋 [ADMIN_API_STACK]:", error.stack);
    
    return new NextResponse(
      JSON.stringify({ error: error.message, stack: error.stack }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { 
        name, lastName, email, specialty, role, password, status, 
        academyName, slug, description, institution, logoUrl, linkedinUrl 
    } = await req.json();

    console.log(`🔍 [ADMIN_PATCH] Iniciando actualización segmentada para ID: ${params.id}`);

    // Limpieza de datos preventiva (User)
    const userData: any = {};
    if (name !== undefined) userData.name = name;
    if (lastName !== undefined) userData.lastName = lastName;
    if (email !== undefined) userData.email = email;
    // Eliminado de la Fase 1: specialty ya no existe en la tabla User
    if (role !== undefined) userData.role = role;
    if (status !== undefined) userData.status = status;

    if (password && password.trim() !== '') {
      userData.passwordHash = await bcrypt.hash(password, 12);
    }

    // FASE 1: Actualizar tabla User
    let updatedUser;
    const oldUser = await prisma.user.findUnique({ where: { id: params.id } }); // Obtener estado previo

    try {
        updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: userData
        });
        console.log("✅ [ADMIN_PATCH] Fase 1 (User) completada exitosamente");

        // Misión: Notificación de Activación de Instructor
        if (
          oldUser?.status === 'PENDING_APPROVAL' && 
          updatedUser.status === 'ACTIVE' && 
          updatedUser.role === 'INSTRUCTOR'
        ) {
          await sendInstructorApprovalEmail(updatedUser.email, updatedUser.name);
        }

    } catch (userError: any) {
        console.error('🔥 ERROR AL ACTUALIZAR (User):', userError.message);
        throw new Error(`Error en tabla User: ${userError.message}`);
    }

    // FASE 2: Sincronización de Perfil si el rol es INSTRUCTOR
    if (updatedUser.role === 'INSTRUCTOR') {
        const profileData: any = {};
        if (academyName !== undefined) profileData.academyName = academyName;
        if (slug !== undefined) profileData.slug = slug.toLowerCase().replace(/\s+/g, '-');
        if (description !== undefined) profileData.description = description;
        if (institution !== undefined) profileData.institution = institution;
        if (logoUrl !== undefined) profileData.logoUrl = logoUrl;
        if (linkedinUrl !== undefined) profileData.linkedinUrl = linkedinUrl;
        if (specialty !== undefined) profileData.specialty = specialty; // Añadido a la Fase 2

        try {
            const existingProfile = await prisma.instructorProfile.findUnique({
                where: { userId: params.id }
            });

            if (existingProfile) {
                if (Object.keys(profileData).length > 0) {
                    await prisma.instructorProfile.update({
                        where: { userId: params.id },
                        data: profileData
                    });
                }
            } else {
                await prisma.instructorProfile.create({
                    data: {
                        userId: params.id,
                        academyName: academyName || `Academia de ${updatedUser.name}`,
                        slug: slug || `${updatedUser.name.toLowerCase()}-${userData.lastName?.toLowerCase() || 'profile'}-${Date.now().toString().slice(-4)}`,
                        commissionRate: 15.00,
                        specialty: specialty || '',
                        ...profileData
                    }
                });
            }
            console.log("✅ [ADMIN_PATCH] Fase 2 (InstructorProfile) completada exitosamente");
        } catch (profileError: any) {
            console.error('🔥 ERROR AL ACTUALIZAR (InstructorProfile):', profileError.message);
            throw new Error(`Error en tabla InstructorProfile: ${profileError.message}`);
        }
    }

    console.log(`--- ACCIÓN ADMIN: Usuario [${params.id}] actualizado por el Administrador [${session.userId}] ---`);

    // Respuesta final serializada y limpia
    const responseData = JSON.parse(JSON.stringify({ 
        success: true, 
        user: updatedUser 
    }));

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('🔥 ERROR CRÍTICO FINAL EN PATCH ADMIN:', error.message);
    return NextResponse.json({ 
        error: 'Error al persistir cambios en el sistema', 
        details: error.message 
    }, { status: 500 });
  }
}
