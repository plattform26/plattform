export const getAccountDeletionWarningTemplate = (name: string, baseUrl: string) => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aviso de inactividad</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #070d1a; color: #CBD5E1;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #070d1a; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0d1524; border: 1px solid #1e293b; border-radius: 24px; padding: 40px; margin: 0 20px; max-width: 600px;">
                    <tr>
                        <td align="center" style="padding-bottom: 30px;">
                            <h1 style="color: #ffffff; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">PLATTFORM</h1>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <h2 style="color: #ffffff; font-size: 20px; margin-top: 0; margin-bottom: 24px;">Hola, ${name}</h2>
                            <p style="color: #94a3b8; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                                Hemos notado que no has iniciado sesión en Plattform durante más de 2 meses y no tienes compras registradas en tu cuenta.
                            </p>
                            <p style="color: #94a3b8; font-size: 16px; line-height: 24px; margin-bottom: 32px;">
                                Como parte de nuestras políticas de limpieza de datos e inactividad, <strong>tu cuenta será eliminada permanentemente en 15 días</strong> si no detectamos nueva actividad.
                            </p>
                            <p style="color: #94a3b8; font-size: 16px; line-height: 24px; margin-bottom: 32px;">
                                Si deseas conservar tu cuenta, lo único que necesitas hacer es iniciar sesión haciendo clic en el botón de abajo:
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding-bottom: 32px;">
                            <a href="${baseUrl}/login" style="display: inline-block; background-color: #06B6D4; color: #000000; font-size: 16px; font-weight: bold; text-decoration: none; padding: 16px 32px; border-radius: 12px;">
                                Conservar mi cuenta
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="border-top: 1px solid #1e293b; padding-top: 32px;">
                            <p style="color: #64748b; font-size: 14px; line-height: 20px; margin: 0; text-align: center;">
                                Si ya no necesitas esta cuenta, puedes ignorar este correo y será eliminada automáticamente.
                                <br><br>
                                © 2026 Plattform. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;
};
