import Image from "next/image";

export default function Home() {
  return (
    // 1. OUTER CONTAINER: Set base page background to deep dark grey
    <div className="flex min-h-screen items-center justify-center bg-gray-900 font-sans">
      
      {/* 2. MAIN CONTENT CARD: Set the card background to a slightly lighter dark grey */}
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-gray-800 sm:items-start">
        
        <Image
          // 3. LOGO: Ensure logo remains visible (white in dark mode)
          className="invert" 
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          {/* 4. HEADING: Light text for high contrast */}
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-gray-50">
            To get started, edit the page.tsx file.
          </h1>
          
          {/* 5. PARAGRAPH: Muted light text */}
          <p className="max-w-md text-lg leading-8 text-gray-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              // 6. LINK: Teal accent color
              className="font-medium text-teal-400 hover:text-teal-300 transition-colors"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              // 7. LINK: Teal accent color
              className="font-medium text-teal-400 hover:text-teal-300 transition-colors"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          
          {/* 8. PRIMARY BUTTON: Teal background with light text */}
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-teal-500 px-5 text-white transition-colors hover:bg-teal-600 md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              // The Vercel logo is black, so we need to invert it to white
              className="invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          
          {/* 9. SECONDARY BUTTON: Bordered button with subtle hover */}
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-gray-600 px-5 text-gray-200 transition-colors hover:bg-gray-700 md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}