import { getCurrentAdmin } from '@/lib/auth/admin';
import { AdminSidebar } from './components/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  // Если не авторизован, показываем без сайдбара (страница логина)
  if (!admin) {
    return <>{children}</>;
  }

  // Если авторизован, показываем с сайдбаром
  return (
    <div className="min-h-screen bg-gray-50" style={{ overscrollBehavior: 'none', touchAction: 'pan-y' }}>
      <AdminSidebar adminEmail={admin.email} />
      
      {/* Main Content */}
      <main className="lg:pl-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
