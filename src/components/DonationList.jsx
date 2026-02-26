// Example: src/components/DonationList.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Import your initialized Firestore
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

function DonationList() {
  const [donations, setDonations] = useState([]);
  const [newDonationData, setNewDonationData] = useState({ donorId: '', bloodGroup: '' });

  // READ: Fetch all donations
  useEffect(() => {
    const fetchDonations = async () => {
      const querySnapshot = await getDocs(collection(db, 'donations'));
      const donationsData = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setDonations(donationsData);
    };
    fetchDonations();
  }, []);

  // CREATE: Add a new donation
  const handleAddDonation = async () => {
    try {
      const docRef = await addDoc(collection(db, 'donations'), {
        ...newDonationData,
        status: 'collected',
        createdAt: new Date()
      });
      console.log('Donation added with ID: ', docRef.id);
      setDonations([...donations, { ...newDonationData, id: docRef.id, status: 'collected', createdAt: new Date() }]);
      setNewDonationData({ donorId: '', bloodGroup: '' }); // Clear form
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  // UPDATE: Update a donation's status
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const donationRef = doc(db, 'donations', id);
      await updateDoc(donationRef, { status: newStatus });
      setDonations(donations.map(d => (d.id === id ? { ...d, status: newStatus } : d)));
      console.log(`Donation ${id} status updated to ${newStatus}`);
    } catch (e) {
      console.error('Error updating document: ', e);
    }
  };

  // DELETE: Delete a donation
  const handleDeleteDonation = async (id) => {
    try {
      await deleteDoc(doc(db, 'donations', id));
      setDonations(donations.filter(d => d.id !== id));
      console.log(`Donation ${id} deleted`);
    } catch (e) {
      console.error('Error deleting document: ', e);
    }
  };

  return (
    <div>
      <h2>Donations</h2>
      <div>
        <input
          type="text"
          placeholder="Donor ID"
          value={newDonationData.donorId}
          onChange={(e) => setNewDonationData({ ...newDonationData, donorId: e.target.value })}
        />
        <input
          type="text"
          placeholder="Blood Group"
          value={newDonationData.bloodGroup}
          onChange={(e) => setNewDonationData({ ...newDonationData, bloodGroup: e.target.value })}
        />
        <button onClick={handleAddDonation}>Add Donation</button>
      </div>
      <ul>
        {donations.map((donation) => (
          <li key={donation.id}>
            {donation.donorId} - {donation.bloodGroup} (Status: {donation.status})
            <button onClick={() => handleUpdateStatus(donation.id, 'approved')}>Approve</button>
            <button onClick={() => handleDeleteDonation(donation.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DonationList;
