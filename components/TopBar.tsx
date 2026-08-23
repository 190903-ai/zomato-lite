import Link from "next/link";

export function TopBar() {
  return (
    <header className="border-b border-[#ece7df] bg-[#faf8f5]">
      <div className="mx-auto flex h-14 w-full max-w-[560px] items-center px-5">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          Zomato&nbsp;<span className="text-[#c2410c]">Lite</span>
        </Link>
      </div>
    </header>
  );
}
