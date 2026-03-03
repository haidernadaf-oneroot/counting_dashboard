// "use client";

// import { useEffect, useState } from "react";

// type Msg = {
//   id: string;
//   body: any; // 👈 change here
//   receipt?: string;
// } | null;

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
//   const [editingIndex, setEditingIndex] = useState<number | null>(null);
//   const [editValue, setEditValue] = useState("");
//   const [videoUrl, setVideoUrl] = useState("");
//   const [purging, setPurging] = useState(false);
//   const [showCompleteModal, setShowCompleteModal] = useState(false);
//   const [completeTruck, setCompleteTruck] = useState("");
//   const [completeDate, setCompleteDate] = useState("");

//   useEffect(() => {
//     fetchCachedMessage();
//     fetchStream(); // only once
//   }, []);

//   async function fetchCachedMessage() {
//     const res = await fetch(`${API}/message`, { cache: "no-store" });
//     setMessage(await res.json());
//   }

//   async function fetchNext() {
//     const res = await fetch(`${API}/fetch`, { method: "POST" });
//     setMessage(await res.json());
//   }

//   function openCompleteModal() {
//     if (!message?.body) return;

//     setCompleteTruck(message.body.truck_number || "");
//     setCompleteDate(new Date().toISOString().split("T")[0]); // default today
//     setShowCompleteModal(true);
//   }

//   async function confirmComplete() {
//     try {
//       await fetch(`${API}/totals/complete`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           truck_number: completeTruck,
//           date: completeDate,
//         }),
//       });

//       setShowCompleteModal(false);
//       alert("SQS Count Completed ✅");
//     } catch (e) {
//       console.log(e);
//     }
//   }

//   /** ⭐ APPROVE (IMPORTANT FIX — stores DB id) */
//   async function approve() {
//     if (!message) return;

//     const res = await fetch(`${API}/approve`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ approvedValue: approveValue, message }),
//     });

//     const data = await res.json();

//     setRows((p) => [
//       ...p,
//       {
//         _id: data.record._id,
//         truck_number: data.record.truck_number,
//         count: data.record.original_count,
//         updated: data.record.approved_count,
//       },
//     ]);

//     setApproveValue("");

//     const next = await fetch(`${API}/fetch`, { method: "POST" });
//     setMessage(await next.json());
//   }

//   async function purgeQueue() {
//     if (purging) return;
//     if (!confirm("Clear queue?")) return;

//     setPurging(true);

//     await fetch(`${API}/deleteAll`, { method: "POST" });

//     setRows([]);
//     setMessage(null);

//     setPurging(false);
//   }

//   /** ⭐ UPDATE (EDIT SAVE) */
//   async function saveEdit(index: number) {
//     const row = rows[index];

//     await fetch(`${API}/approval/${row._id}`, {
//       method: "PUT",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ approved_count: Number(editValue) }),
//     });

//     setRows((r) =>
//       r.map((x, i) => (i === index ? { ...x, updated: Number(editValue) } : x)),
//     );

//     setEditingIndex(null);
//     setEditValue("");
//   }

//   async function fetchStream() {
//     try {
//       const token = localStorage.getItem("token");

//       const res = await fetch("https://country-delight.markhet.app/youtube", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         cache: "no-store",
//       });

//       if (!res.ok) {
//         console.log("Not authenticated");
//         return;
//       }

//       const data = await res.json();

//       if (!data.youtube_url) return;

//       const id = new URL(data.youtube_url).searchParams.get("v");
//       if (!id) return;

//       setVideoUrl(`https://www.youtube.com/embed/${id}`);
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   const total = rows.reduce((s, r) => s + r.updated, 0);

//   return (
//     <div className="h-screen grid grid-cols-1 md:grid-cols-2 bg-black">
//       {/* STREAM */}
//       {videoUrl ? (
//         <iframe className="w-full h-full" src={videoUrl} />
//       ) : (
//         <div className="flex items-center justify-center text-white/50">
//           No stream
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

//         {/* CURRENT */}
//         <div className="bg-white/10 p-4 rounded">
//           <div className="font-bold mb-2">Current Truck</div>

//           {message?.body ? (
//             <table className="w-full text-sm">
//               <thead>
//                 <tr>
//                   <th className="text-left p-2">Truck</th>
//                   <th className="text-left p-2">Count</th>
//                   <th className="text-left p-2">Approve</th>
//                   <th />
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td className="p-2">{message.body.truck_number}</td>
//                   <td className="p-2">{message.body.count}</td>
//                   <td className="p-2">
//                     <input
//                       value={approveValue}
//                       onChange={(e) => setApproveValue(e.target.value)}
//                       className="bg-black/40 p-2 rounded w-24"
//                     />
//                   </td>
//                   <td className="flex gap-2">
//                     <button
//                       onClick={approve}
//                       className="bg-blue-600 px-3 py-2 rounded"
//                     >
//                       Approve
//                     </button>

//                     <button
//                       onClick={openCompleteModal}
//                       className="bg-green-600 px-3 py-2 rounded"
//                     >
//                       Complete
//                     </button>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           ) : (
//             <div>No message</div>
//           )}
//         </div>

//         {/* HISTORY */}
//         <div className="bg-white/10 p-4 rounded">
//           <div className="font-bold mb-2">Approved Trucks</div>

//           <div className="h-64 overflow-auto border border-white/10 rounded">
//             <table className="w-full text-sm">
//               <thead className="sticky top-0 bg-gray-800">
//                 <tr>
//                   <th className="text-left p-2">Truck</th>
//                   <th className="text-left p-2">Count</th>
//                   <th className="text-left p-2">Updated</th>
//                   <th className="text-left p-2">Action</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {rows.map((r, i) => (
//                   <tr key={r._id} className="border-b border-white/10">
//                     <td className="p-2">{r.truck_number}</td>
//                     <td className="p-2">{r.count}</td>

//                     <td className="p-2">
//                       {editingIndex === i ? (
//                         <input
//                           value={editValue}
//                           onChange={(e) => setEditValue(e.target.value)}
//                           className="bg-black/40 p-1 w-20 rounded"
//                         />
//                       ) : (
//                         r.updated
//                       )}
//                     </td>

//                     <td className="p-2">
//                       {editingIndex === i ? (
//                         <button
//                           onClick={() => saveEdit(i)}
//                           className="bg-green-600 px-2 py-1 rounded"
//                         >
//                           Save
//                         </button>
//                       ) : (
//                         <button
//                           onClick={() => {
//                             setEditingIndex(i);
//                             setEditValue(String(r.updated));
//                           }}
//                           className="bg-yellow-600 px-2 py-1 rounded"
//                         >
//                           Edit
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           <div className="mt-3 font-bold">Total Updated Count: {total}</div>
//         </div>
//       </div>

//       {showCompleteModal && (
//         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
//           <div className="bg-white text-black p-6 rounded-xl w-96 shadow-2xl space-y-5">
//             <div className="text-xl font-bold text-gray-800">
//               Complete SQS Count
//             </div>

//             {/* Truck */}
//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">
//                 Truck Number
//               </label>
//               <input
//                 value={completeTruck}
//                 onChange={(e) => setCompleteTruck(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//               />
//             </div>

//             {/* Date */}
//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">
//                 Date
//               </label>
//               <input
//                 type="date"
//                 value={completeDate}
//                 onChange={(e) => setCompleteDate(e.target.value)}
//                 className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
//               />
//             </div>

//             {/* Buttons */}
//             <div className="flex justify-end gap-3 pt-2">
//               <button
//                 onClick={() => setShowCompleteModal(false)}
//                 className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={confirmComplete}
//                 className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
//               >
//                 Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";

type Msg = {
  id: string;
  body: any;
  receipt?: string;
} | null;

type Row = {
  _id: string;
  truck_number: string;
  count: number;
  updated: number;
};

export default function HomePage() {
  const API = "https://counting-dashboard-backend.onrender.com";

  const [message, setMessage] = useState<Msg>(null);
  const [approveValue, setApproveValue] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [purging, setPurging] = useState(false);

  // 🔥 NEW STATES
  const [isFetching, setIsFetching] = useState(false);
  const [fetchStatus, setFetchStatus] = useState<
    "idle" | "loading" | "success" | "empty"
  >("idle");

  useEffect(() => {
    fetchCachedMessage();
    fetchStream();
  }, []);

  async function fetchCachedMessage() {
    const res = await fetch(`${API}/message`, { cache: "no-store" });
    const data = await res.json();
    setMessage(data);
  }

  // 🔥 IMPROVED FETCH
  async function fetchNext() {
    try {
      setIsFetching(true);
      setFetchStatus("loading");

      const res = await fetch(`${API}/fetch`, { method: "POST" });
      const data = await res.json();

      setMessage(data);

      if (data) {
        setFetchStatus("success");
      } else {
        setFetchStatus("empty");
      }
    } catch (err) {
      console.log(err);
      setFetchStatus("empty");
    } finally {
      setIsFetching(false);
    }
  }

  async function approve() {
    if (!message) return;

    const res = await fetch(`${API}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approvedValue: approveValue, message }),
    });

    const data = await res.json();

    setRows((p) => [
      ...p,
      {
        _id: data.record._id,
        truck_number: data.record.truck_number,
        count: data.record.original_count,
        updated: data.record.approved_count,
      },
    ]);

    setApproveValue("");

    await fetchNext(); // fetch next automatically
  }

  async function purgeQueue() {
    if (purging) return;
    if (!confirm("Clear queue?")) return;

    setPurging(true);
    await fetch(`${API}/deleteAll`, { method: "POST" });
    setRows([]);
    setMessage(null);
    setFetchStatus("idle");
    setPurging(false);
  }

  async function saveEdit(index: number) {
    const row = rows[index];

    await fetch(`${API}/approval/${row._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved_count: Number(editValue) }),
    });

    setRows((r) =>
      r.map((x, i) => (i === index ? { ...x, updated: Number(editValue) } : x)),
    );

    setEditingIndex(null);
    setEditValue("");
  }

  async function fetchStream() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("https://country-delight.markhet.app/youtube", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = await res.json();
      if (!data.youtube_url) return;

      const id = new URL(data.youtube_url).searchParams.get("v");
      if (!id) return;

      setVideoUrl(`https://www.youtube.com/embed/${id}`);
    } catch (err) {
      console.log(err);
    }
  }

  const total = rows.reduce((s, r) => s + r.updated, 0);

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-2 bg-black">
      {/* STREAM */}
      {videoUrl ? (
        <iframe className="w-full h-full" src={videoUrl} />
      ) : (
        <div className="flex items-center justify-center text-white/40">
          No stream
        </div>
      )}

      {/* RIGHT PANEL */}
      <div className="p-6 bg-gray-900 text-white space-y-6">
        {/* FETCH BUTTON */}
        <button
          onClick={fetchNext}
          disabled={isFetching}
          className={`w-full py-2 rounded font-medium transition ${
            isFetching
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {isFetching ? "Fetching..." : "Fetch Next"}
        </button>

        {/* STATUS */}
        {fetchStatus === "loading" && (
          <div className="text-blue-400 text-sm animate-pulse">
            🔄 Fetching message from SQS...
          </div>
        )}

        {fetchStatus === "success" && (
          <div className="text-green-400 text-sm">
            ✅ Message received successfully
          </div>
        )}

        {fetchStatus === "empty" && (
          <div className="text-yellow-400 text-sm">
            ⚠️ No message available in queue
          </div>
        )}

        {/* CLEAR */}
        <button
          onClick={purgeQueue}
          className="w-full py-2 bg-red-600 rounded hover:bg-red-700 transition"
        >
          {purging ? "Clearing..." : "Clear Queue"}
        </button>

        {/* CURRENT MESSAGE */}
        <div className="bg-white/10 p-4 rounded">
          <div className="font-bold mb-2">Current Truck</div>

          {message?.body ? (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2">Truck</th>
                  <th className="text-left p-2">Count</th>
                  <th className="text-left p-2">Approve</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">{message.body.truck_number}</td>
                  <td className="p-2">{message.body.count}</td>
                  <td className="p-2">
                    <input
                      value={approveValue}
                      onChange={(e) => setApproveValue(e.target.value)}
                      className="bg-black/40 p-2 rounded w-24"
                    />
                  </td>
                  <td>
                    <button
                      onClick={approve}
                      className="bg-blue-600 px-3 py-2 rounded hover:bg-blue-700"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="text-center text-white/40 py-6">
              {fetchStatus === "loading"
                ? "Waiting for message..."
                : "No truck message available"}
            </div>
          )}
        </div>

        {/* HISTORY */}
        <div className="bg-white/10 p-4 rounded">
          <div className="font-bold mb-2">Approved Trucks</div>

          <div className="h-64 overflow-auto border border-white/10 rounded">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-800">
                <tr>
                  <th className="text-left p-2">Truck</th>
                  <th className="text-left p-2">Count</th>
                  <th className="text-left p-2">Updated</th>
                  <th className="text-left p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r._id} className="border-b border-white/10">
                    <td className="p-2">{r.truck_number}</td>
                    <td className="p-2">{r.count}</td>
                    <td className="p-2">
                      {editingIndex === i ? (
                        <input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="bg-black/40 p-1 w-20 rounded"
                        />
                      ) : (
                        r.updated
                      )}
                    </td>
                    <td className="p-2">
                      {editingIndex === i ? (
                        <button
                          onClick={() => saveEdit(i)}
                          className="bg-green-600 px-2 py-1 rounded"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingIndex(i);
                            setEditValue(String(r.updated));
                          }}
                          className="bg-yellow-600 px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 font-bold">Total Updated Count: {total}</div>
        </div>
      </div>
    </div>
  );
}
