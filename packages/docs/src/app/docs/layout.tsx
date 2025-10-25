
import { DocSidebar } from '@/components/sidebar';

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white">
            {/* Sidebar  */}
            <DocSidebar />

            {/* Main content */}
            <div className="lg:pl-64">
                <main className="py-6">
                    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
