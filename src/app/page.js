import { CATEGORIES } from "@/lib/constants";

export default function Home() {
  return (
    <>
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-[#2E7048] to-[#1F5233] px-7 py-9 text-white">
        <h1 className="mb-2 text-2xl font-extrabold sm:text-3xl">
          Dale una segunda vida a tus cosas
        </h1>
        <p className="mb-5 max-w-md text-sm leading-relaxed text-[#DCEEE1]">
          Comprá y vendé artículos usados cerca tuyo, en cualquier rincón de Uruguay. Publicá en
          menos de un minuto.
        </p>
      </div>

      <h3 className="mb-3 text-sm font-bold">Categorías</h3>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <span
            key={c.id}
            className="flex-shrink-0 whitespace-nowrap rounded-full border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-800"
          >
            {c.label}
          </span>
        ))}
      </div>

      <p className="text-sm text-gray-400">
        El feed de publicaciones y la búsqueda llegan en la próxima fase.
      </p>
    </>
  );
}
