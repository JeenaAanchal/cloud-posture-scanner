export default function Card({ title, value }) {
  return (
    <div className="bg-white border-2 border-black rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition duration-300">
      <p className="text-lg text-gray-600 font-medium">{title}</p>
      <h2 className="text-3xl font-bold mt-3">{value}</h2>
    </div>
  );
}
