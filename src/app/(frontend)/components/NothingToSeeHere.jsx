"use client"

export default function NothingToSeeHere() {
  return (
    <div className="flex h-full min-h-[300px] w-full items-center justify-center text-center">
      {/* Inline keyframes so no external CSS file needed */}
      <style jsx>{`
        @keyframes eye-blink {
          0%,
          90%,
          100% {
            transform: scaleY(1);
          }
          95% {
            transform: scaleY(0.1);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .blink {
          animation: eye-blink 3s infinite;
        }
        .fade-in-up {
          animation: fade-in-up 1.5s ease-in-out;
        }
      `}</style>

      <div className="flex flex-col items-center justify-center px-10 py-16">
        <div className="flex gap-10 mb-8">
          <div className="w-24 h-24 bg-white border-[6px] border-black rounded-full flex items-center justify-center overflow-hidden">
            <div className="w-8 h-8 bg-black rounded-full blink" />
          </div>
          <div className="w-24 h-24 bg-white border-[6px] border-black rounded-full flex items-center justify-center overflow-hidden">
            <div className="w-8 h-8 bg-black rounded-full blink" />
          </div>
        </div>

        <p className="fade-in-up text-3xl md:text-4xl font-extrabold text-emerald-500">
          Nothing to see here...
        </p>
      </div>
    </div>
  )
}
