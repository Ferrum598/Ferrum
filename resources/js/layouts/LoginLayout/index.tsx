import React from 'react';
export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen items-center justify-center gap-3 bg-white p-5">
            <div className="flex min-h-[35%] min-w-[90%] flex-col items-center justify-center rounded-[10px] border border-gray-300 bg-white p-6 shadow-[-20px_15px_10px_0px_rgba(0,0,0,0.2)] sm:h-[50vh] sm:min-w-[30%] sm:justify-normal">
                <div className="min-h-full min-w-full">{children}</div>
            </div>
            <img
                src="/images/Logotipo.jpg"
                alt="Logotipo"
                className="hidden rotate-90 sm:block md:block"
            />
        </div>
    );
}
