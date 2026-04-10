import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import pdfParse from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sub = await prisma.instructorSubscription.findFirst({
      where: { instructor: { userId: session.userId }, status: 'ACTIVE' },
      include: { plan: true }
    });

    if (!sub || !sub.plan.aiEnabled) {
      return NextResponse.json({ error: 'Actualiza a Scale para usar la IA' }, { status: 403 });
    }

    if (sub.plan.name !== 'scale') {
      return NextResponse.json({ error: 'Actualiza a Scale para usar la IA' }, { status: 403 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No se enviaron archivos' }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ error: 'Límite máximo de 5 PDFs superado.' }, { status: 400 });
    }

    let combinedText = '';
    for (const file of files) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return NextResponse.json({ error: 'Solo se permiten archivos .pdf' }, { status: 400 });
      }
      const buffer = await file.arrayBuffer();
      const data = await pdfParse(Buffer.from(buffer));
      combinedText += `\n--- INICIO PDF: ${file.name} ---\n`;
      combinedText += data.text;
      combinedText += `\n--- FIN PDF ---\n`;
    }

    return NextResponse.json({ text: combinedText });

  } catch (error: any) {
    console.error('PDF Upload Error:', error);
    return NextResponse.json({ error: 'Error procesando los PDFs internos.', details: error.message }, { status: 500 });
  }
}
