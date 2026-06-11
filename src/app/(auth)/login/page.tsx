import { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Iniciar Sesión | Plattform',
  description: 'Inicia sesión en Plattform para acceder a tu academia digital, crear cursos y gestionar tus alumnos.',
  robots: {
    index: false,
    follow: true,
  }
};

export default function LoginPage() {
  return <LoginClient />;
}