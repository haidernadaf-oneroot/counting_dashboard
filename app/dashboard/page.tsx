// "use client";

// import { useEffect, useState } from "react";

// type Msg = { id: string; body: string; receipt?: string } | null;

// type Row = {
//   _id: string;
//   truck_number: string;
//   count: number;
//   updated: number;
// };

// export default function HomePage() {
//   const API = "https://counting-dashboard-backend.onrender.com";

//   const [message, setMessage] = useState<Msg>(null);
//   const [approveValue, setApproveValue] = useState("");
//   const [rows, setRows] = useState<Row[]>([]);
//   const [loadingFetch, setLoadingFetch] = useState(false);
//   const [approving, setApproving] = useState(false);
//   const [purging, setPurging] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editValue, setEditValue] = useState("");

//   // stream
//   const [videoUrl, setVideoUrl] = useState("");

//   useEffect(() => {
//     fetchCachedMessage();
//     fetchStream();
//     const interval = setInterval(fetchStream, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   async function fetchCachedMessage() {
//     const res = await fetch(`${API}/message`, { cache: "no-store" });
//     const data = await res.json();
//     setMessage(data);
//   }

//   async function fetchNext() {
//     if (loadingFetch) return;
//     setLoadingFetch(true);

//     const res = await fetch(`${API}/fetch`, { method: "POST" });
//     const data = await res.json();
//     setMessage(data || null);

//     setLoadingFetch(false);
//   }

//   async function updateRow(id: string) {
//     await fetch(`${API}/approval/${id}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ approved_count: Number(editValue) }),
//     });

//     setRows((rows) =>
//       rows.map((r) =>
//         r._id === id ? { ...r, updated: Number(editValue) } : r,
//       ),
//     );

//     setEditingId(null);
//     setEditValue("");
//   }

//   async function approve() {
//     if (!message || approving) return;

//     setApproving(true);

//     const parsed = JSON.parse(message.body);

//     // ⭐ push into history table
//     // setRows((prev) => [
//     //   ...prev,
//     //   {
//     //     truck_number: parsed.truck_number,
//     //     count: Number(parsed.count),
//     //     updated: Number(approveValue),
//     //   },
//     // ]);
//     const res = await fetch(`${API}/approve`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         approvedValue: approveValue,
//         message,
//       }),
//     });

//     const data = await res.json();

//     // ⭐ push DB record (IMPORTANT)
//     setRows((prev) => [
//       ...prev,
//       {
//         _id: data.record._id,
//         truck_number: data.record.truck_number,
//         count: data.record.original_count,
//         updated: data.record.approved_count,
//       },
//     ]);

//     await fetch(`${API}/approve`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({
//         approvedValue: approveValue,
//         message,
//       }),
//     });

//     setApproveValue("");

//     const next = await fetch(`${API}/fetch`, { method: "POST" });
//     const nextData = await next.json();
//     setMessage(nextData || null);

//     setApproving(false);
//   }

//   async function fetchStream() {
//     try {
//       const res = await fetch("https://country-delight.markhet.app/youtube", {
//         cache: "no-store",
//       });

//       const data = await res.json();
//       if (!data.youtube_url) return;

//       const id = new URL(data.youtube_url).searchParams.get("v");
//       if (!id) return;

//       setVideoUrl(`https://www.youtube.com/embed/${id}`);
//     } catch {}
//   }

//   async function purgeQueue() {
//     if (purging) return;

//     const ok = confirm("Delete ALL SQS messages?");
//     if (!ok) return;

//     setPurging(true);

//     try {
//       const res = await fetch(`${API}/deleteAll`, {
//         method: "POST",
//       });

//       const data = await res.json();

//       console.log("purged:", data);

//       // clear UI
//       setRows([]);
//       setMessage(null);
//     } catch (e) {
//       console.log(e);
//     } finally {
//       setPurging(false);
//     }
//   }

//   const total = rows.reduce((s, r) => s + r.updated, 0);

//   const parsed = message ? JSON.parse(message.body) : null;

//   return (
//     <div className="h-screen grid grid-cols-1 md:grid-cols-2 bg-black">
//       {/* LEFT STREAM */}
//       {/* <iframe className="w-full h-full" src={videoUrl} /> */}
//       {videoUrl ? (
//         <iframe className="w-full h-full" src={videoUrl} />
//       ) : (
//         <div className="w-full h-full bg-black flex items-center justify-center text-white">
//           Loading stream...
//         </div>
//       )}
//       {/* RIGHT */}
//       <div className="p-6 bg-gray-900 text-white space-y-6">
//         <button
//           onClick={fetchNext}
//           className="w-full py-2 bg-indigo-600 rounded"
//         >
//           Fetch Next
//         </button>

//         <button onClick={purgeQueue} className="w-full py-2 bg-red-600 rounded">
//           {purging ? "Clearing..." : "Clear Queue"}
//         </button>

//         {/* ⭐ TABLE 1 — CURRENT */}
//         <div className="bg-white/10 p-4 rounded">
//           <div className="font-bold mb-2">Current Truck</div>

//           {parsed ? (
//             <table className="w-full text-sm">
//               <thead>
//                 <tr>
//                   <th className="text-left p-2">Truck</th>
//                   <th className="text-left p-2">Count</th>
//                   <th className="text-left p-2">Approve</th>
//                   <th></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td className="p-2">{parsed.truck_number}</td>
//                   <td className="p-2">{parsed.count}</td>
//                   <td className="p-2">
//                     <input
//                       value={approveValue}
//                       onChange={(e) => setApproveValue(e.target.value)}
//                       className="bg-black/40 p-2 rounded w-24"
//                     />
//                   </td>
//                   <td>
//                     <button
//                       onClick={approve}
//                       className="bg-blue-600 px-3 py-2 rounded"
//                     >
//                       Approve
//                     </button>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           ) : (
//             <div>No message</div>
//           )}
//         </div>

//         {/* ⭐ TABLE 2 — HISTORY */}
//         {/* <div className="bg-white/10 p-4 rounded">
//           <div className="font-bold mb-2">Approved Trucks</div>

//           <table className="w-full text-sm">
//             <thead>
//               <tr>
//                 <th className="text-left p-2">Truck</th>
//                 <th className="text-left p-2">Count</th>
//                 <th className="text-left p-2">Updated</th>
//               </tr>
//             </thead>

//             <tbody>
//               {rows.map((r, i) => (
//                 <tr key={i}>
//                   <td className="p-2">{r.truck_number}</td>
//                   <td className="p-2">{r.count}</td>
//                   <td className="p-2">{r.updated}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <div className="mt-3 font-bold">Total Updated Count: {total}</div>
//         </div> */}
//         <div className="bg-white/10 p-4 rounded">
//           <div className="font-bold mb-2">Approved Trucks</div>

//           {/* ⭐ fixed height scroll area */}
//           <div className="h-64 overflow-auto border border-white/10 rounded">
//             <table className="w-full text-sm">
//               {/* sticky header */}
//               <thead className="sticky top-0 bg-gray-800">
//                 <tr>
//                   <th className="text-left p-2 whitespace-nowrap">Truck</th>
//                   <th className="text-left p-2 whitespace-nowrap">Count</th>
//                   <th className="text-left p-2 whitespace-nowrap">Updated</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {rows.map((r, i) => (
//                   <tr key={i} className="border-b border-white/10">
//                     <td className="p-2 whitespace-nowrap">{r.truck_number}</td>
//                     <td className="p-2 whitespace-nowrap">{r.count}</td>
//                     <td className="p-2 whitespace-nowrap">
//                       {editingId === r._id ? (
//                         <div className="flex gap-2">
//                           <input
//                             value={editValue}
//                             onChange={(e) => setEditValue(e.target.value)}
//                             className="bg-black/40 p-1 w-20 rounded"
//                           />
//                           <button
//                             onClick={() => updateRow(r._id)}
//                             className="bg-green-600 px-2 rounded"
//                           >
//                             Save
//                           </button>
//                         </div>
//                       ) : (
//                         <div className="flex gap-2 items-center">
//                           {r.updated}
//                           <button
//                             onClick={() => {
//                               setEditingId(r._id);
//                               setEditValue(String(r.updated));
//                             }}
//                             className="bg-yellow-600 px-2 rounded text-xs"
//                           >
//                             Edit
//                           </button>
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* total always visible */}
//           <div className="mt-3 font-bold">Total Updated Count: {total}</div>
//         </div>
//       </div>
//     </div>
//   );
// }
