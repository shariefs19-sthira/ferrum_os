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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{product.icon}</span>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-600">{product.code}</span>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h2>
      <p className="text-gray-600 text-sm">{product.description}</p>
      {!product.comingSoon && product.href && <Link href={product.href} className="mt-4 inline-block text-blue-600 font-medium">Explore →</Link>}
    </div>
  );
}