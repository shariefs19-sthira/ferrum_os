import Link from "next/link";

interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  href?: string;
  comingSoon: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group flex min-h-[220px] flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl shadow-inner">
          {product.icon || "•"}
        </span>
        <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
          {product.code}
        </span>
      </div>

      <div className="mt-5 space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">{product.name}</h2>
        <p className="text-sm leading-6 text-slate-600">{product.description}</p>
      </div>

      {!product.comingSoon && product.href && (
        <Link
          href={product.href}
          className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
        >
          Explore
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}