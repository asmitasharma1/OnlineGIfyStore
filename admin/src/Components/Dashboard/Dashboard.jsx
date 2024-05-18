import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:4000/orders');
        const data = await response.json();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('http://localhost:4000/customers');
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className='dashboard'>
      <h2>Admin Dashboard</h2>
      <div className="orders-section">
        <h3>All Orders</h3>
        <ul>
          {orders.map((order) => (
            <li key={order.id}>
              <p>Order Number: {order.orderNumber}</p>
              <p>Total Amount: {order.totalAmount}</p>
              <p>Status: {order.status}</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="customers-section">
        <h3>All Customers</h3>
        <ul>
          {customers.map((customer) => (
            <li key={customer.id}>
              <p>Name: {customer.name}</p>
              <p>Email: {customer.email}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;