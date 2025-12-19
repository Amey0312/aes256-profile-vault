import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]); // <--- NEW: State for user list
  const [transferData, setTransferData] = useState({ receiver_username: '', amount: '' });
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // <--- UPDATED: Fetch 'users' endpoint along with profile and history
      const [profileRes, historyRes, usersRes] = await Promise.all([
        api.get('/profile/'),
        api.get('/transactions/'),
        api.get('/users/') 
      ]);
      
      setProfile(profileRes.data);
      setTransactions(historyRes.data);
      setUsers(usersRes.data); // <--- Store users
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        alert("Session expired");
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });
    
    // Validation
    if (!transferData.receiver_username) {
        setMsg({ type: 'error', text: 'Please select a receiver.' });
        return;
    }

    try {
      await api.post('/transfer/', transferData);
      setMsg({ type: 'success', text: 'Transfer Successful!' });
      setTransferData({ receiver_username: '', amount: '' }); // Reset form
      fetchData(); // Refresh balance and history
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Transfer Failed' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Financial Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Logout</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Identity Card */}
            <div className="bg-white shadow rounded-lg p-6 border-l-4 border-blue-600">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Identity Profile</h2>
                <div className="space-y-3">
                    <p><span className="font-medium">User:</span> {profile?.username}</p>
                    <p><span className="font-medium">Email:</span> {profile?.email}</p>
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <label className="text-xs font-bold text-yellow-800 uppercase">Decrypted ID</label>
                        <p className="text-xl font-mono text-gray-800">{profile?.aadhaar_number}</p>
                    </div>
                </div>
            </div>

            {/* 2. Wallet & Transfer */}
            <div className="bg-white shadow rounded-lg p-6 border-l-4 border-green-600">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Wallet & Transfer</h2>
                <div className="mb-6">
                    <p className="text-sm text-gray-500">Available Balance</p>
                    <p className="text-4xl font-bold text-green-700">${profile?.balance}</p>
                </div>

                {msg.text && (
                    <div className={`p-2 mb-3 text-sm rounded ${msg.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {msg.text}
                    </div>
                )}

                <form onSubmit={handleTransfer} className="flex gap-2">
                    {/* UPDATED: Select Dropdown instead of Input */}
                    <select
                        className="flex-1 p-2 border rounded bg-white"
                        value={transferData.receiver_username}
                        onChange={(e) => setTransferData({...transferData, receiver_username: e.target.value})}
                        required
                    >
                        <option value="">Select Receiver</option>
                        {users.map((user) => (
                            <option key={user.username} value={user.username}>
                                {user.username}
                            </option>
                        ))}
                    </select>

                    <input 
                        type="number" 
                        placeholder="Amount" 
                        className="w-24 p-2 border rounded"
                        value={transferData.amount}
                        onChange={(e) => setTransferData({...transferData, amount: e.target.value})}
                        required
                        min="1"
                    />
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Pay</button>
                </form>
            </div>
        </div>

        {/* 3. Transaction History Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b">
                <h3 className="text-lg font-bold text-gray-700">Audit Log / Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 uppercase font-medium border-b">
                        <tr>
                            <th className="px-6 py-3">Time</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Details</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {transactions.map((tx) => {
                            const isSender = tx.sender_name === profile?.username;
                            return (
                                <tr key={tx.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">{new Date(tx.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs ${isSender ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                            {isSender ? 'DEBIT' : 'CREDIT'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {isSender ? `To: ${tx.receiver_name}` : `From: ${tx.sender_name}`}
                                    </td>
                                    <td className={`px-6 py-4 font-bold ${isSender ? 'text-red-600' : 'text-green-600'}`}>
                                        {isSender ? '-' : '+'}${tx.amount}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{tx.status}</td>
                                </tr>
                            );
                        })}
                        {transactions.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-400">No transactions found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;