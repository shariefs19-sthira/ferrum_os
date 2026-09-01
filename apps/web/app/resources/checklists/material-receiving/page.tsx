const materialReceivingSections = [
  {
    title: 'Delivery Verification',
    items: [
      'Delivery note quantities checked against the purchase order before offload',
      'Material grade, size, and specification confirmed against the order, not just the label',
      'Visible damage or contamination noted and photographed before acceptance',
      'Mill test certificates or compliance documents collected for structural materials',
    ],
  },
  {
    title: 'Storage and Handling',
    items: [
      'Material moved to the correct storage location per its storage requirement (dry, raised, covered)',
      'Batch or lot numbers recorded and traceable to the storage location',
      'Stock rotated on a first-in-first-out basis where shelf life or curing time applies',
      'Storage area protected from the specific degradation risk for that material (moisture, UV, contamination)',
    ],
  },
  {
    title: 'Records and Discrepancies',
    items: [
      'Goods-received note completed and matched against the delivery and purchase order',
      'Any shortage, damage, or non-conformance logged and reported to procurement same day',
      'Compliance documents filed against the batch for later traceability',
      'Rejected material clearly tagged and segregated pending return or disposal decision',
    ],
  },
]

export default function MaterialReceivingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Material Receiving Checklist
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Verifying What Actually Arrives on Site
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          {materialReceivingSections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
