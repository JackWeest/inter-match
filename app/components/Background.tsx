'use client';
export default function Background() {
  return (
    <>
      {/* 💻 PC / TABLET */}
      <div
        className="hidden md:block fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "url('/background.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* 📱 CELULAR */}
      <img
        src="/background.webp"
        alt="Fundo Mobile"
        className="block md:hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vh] h-[100vw] max-w-none rotate-90 object-cover z-0 pointer-events-none"
      />
    </>
  );
}