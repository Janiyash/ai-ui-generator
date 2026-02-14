export default function Card({ children }: any) {
  return (
    <div className="p-4 border rounded shadow bg-white">
      {children}
    </div>
  );
}
