import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function OrderForm() {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_id: '',
        quantity: 1,
        product: '', // Will store the product ID
        product_cost: 0,
        user_email: ''
    });
    const [message, setMessage] = useState('');

    // Fetch products for dropdown
    useEffect(() => {
        axios.get(`${API_URL}/products/`)
            .then(res => {
                setProducts(res.data);
                if (res.data.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        product: res.data[0].id,
                        product_cost: res.data[0].cost
                    }));
                }
            })
            .catch(err => console.error("Error fetching products:", err));
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'product') {
            const selectedProduct = products.find(p => p.id === parseInt(value));
            if (selectedProduct) {
                setFormData(prev => ({ ...prev, product_cost: selectedProduct.cost }));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage('Submitting...');

        const orderData = {
            customer_name: formData.customer_name,
            customer_id: formData.customer_id,
            user_email: formData.user_email,
            product: formData.product,
            quantity: formData.quantity,
        };

        axios.post(`${API_URL}/orders/create/`, orderData)
            .then(res => {
                setMessage(`Order ${res.data.id} placed successfully!`);
                setFormData({
                    customer_name: '', customer_id: '', quantity: 1,
                    product: products.length > 0 ? products[0].id : '',
                    product_cost: products.length > 0 ? products[0].cost : 0,
                    user_email: ''
                });
            })
            .catch(err => {
                console.error("Error creating order:", err.response?.data || err);
                setMessage('Error placing order. Check console.');
            });
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: 'auto', padding: '20px' }}>
            <h2>Place New Order</h2>

            <label>Customer Name:</label>
            <input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} required />

            <label>Customer ID:</label>
            <input type="text" name="customer_id" value={formData.customer_id} onChange={handleChange} required />

            <label>User Email:</label>
            <input type="email" name="user_email" value={formData.user_email} onChange={handleChange} required />

            <label>Product:</label>
            <select name="product" value={formData.product} onChange={handleChange} required>
                {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>

            <label>Product Cost (Read-only):</label>
            <input type="number" name="product_cost" value={formData.product_cost} readOnly />

            <label>Quantity:</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" required />

            <button type="submit">Submit Order</button>

            {message && <p>{message}</p>}
        </form>
    );
}

export default OrderForm;
