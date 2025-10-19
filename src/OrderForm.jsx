import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

function OrderForm() {
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_id: '',
        quantity: 1,
        product: '',
        product_cost: 0,
        user_email: ''
    });
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

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

    const validateCustomerName = (name) => {
        if (!name.trim()) {
            return 'Customer name is required';
        }
        if (!/^[a-zA-Z\s]+$/.test(name)) {
            return 'Customer name should contain only letters and spaces';
        }
        return '';
    };

    const validateCustomerId = (id) => {
        if (!id.trim()) {
            return 'Customer ID is required';
        }
        if (id.length < 8) {
            return 'Customer ID must be at least 8 characters';
        }
        if (!/^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(id)) {
            return 'Customer ID should contain only numbers and symbols';
        }
        return '';
    };

    const validateEmail = (email) => {
        if (!email.trim()) {
            return 'Email is required';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return 'Please enter a valid email address';
        }
        return '';
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field
        setErrors(prev => ({ ...prev, [name]: '' }));

        if (name === 'product') {
            const selectedProduct = products.find(p => p.id === parseInt(value));
            if (selectedProduct) {
                setFormData(prev => ({ ...prev, product_cost: selectedProduct.cost }));
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const newErrors = {};
        
        // Validate all fields
        const nameError = validateCustomerName(formData.customer_name);
        if (nameError) newErrors.customer_name = nameError;
        
        const idError = validateCustomerId(formData.customer_id);
        if (idError) newErrors.customer_id = idError;
        
        const emailError = validateEmail(formData.user_email);
        if (emailError) newErrors.user_email = emailError;
        
        if (!formData.product) {
            newErrors.product = 'Please select a product';
        }
        
        if (formData.quantity < 1) {
            newErrors.quantity = 'Quantity must be at least 1';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setMessage('');
            return;
        }

        setMessage('Submitting...');
        setErrors({});

        const orderData = {
            customer_name: formData.customer_name,
            customer_id: formData.customer_id,
            user_email: formData.user_email,
            product: formData.product,
            quantity: formData.quantity,
        };

        axios.post(`${API_URL}/orders/create/`, orderData)
            .then(res => {
                setMessage(`Order placed successfully!`);
                setFormData({
                    customer_name: '', 
                    customer_id: '', 
                    quantity: 1,
                    product: products.length > 0 ? products[0].id : '',
                    product_cost: products.length > 0 ? products[0].cost : 0,
                    user_email: ''
                });
            })
            .catch(err => {
                console.error("Error creating order:", err.response?.data || err);
                setMessage('Error placing order. Please try again.');
            });
    };

    return (
        <div style={styles.container}>
            <style>{cssStyles}</style>
            <div style={styles.formCard}>
                <div style={styles.header}>
                    <h2 style={styles.title}>Place New Order</h2>
                    <p style={styles.subtitle}>Fill in the details below to create your order</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Customer Name</label>
                        <input 
                            type="text" 
                            name="customer_name" 
                            value={formData.customer_name} 
                            onChange={handleChange}
                            style={{...styles.input, ...(errors.customer_name ? styles.inputError : {})}}
                            placeholder="Enter customer name"
                        />
                        {errors.customer_name && <span style={styles.errorText}>{errors.customer_name}</span>}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Customer ID</label>
                        <input 
                            type="text" 
                            name="customer_id" 
                            value={formData.customer_id} 
                            onChange={handleChange}
                            style={{...styles.input, ...(errors.customer_id ? styles.inputError : {})}}
                            placeholder="Min 8 characters (numbers & symbols only)"
                        />
                        {errors.customer_id && <span style={styles.errorText}>{errors.customer_id}</span>}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>User Email</label>
                        <input 
                            type="email" 
                            name="user_email" 
                            value={formData.user_email} 
                            onChange={handleChange}
                            style={{...styles.input, ...(errors.user_email ? styles.inputError : {})}}
                            placeholder="customer@example.com"
                        />
                        {errors.user_email && <span style={styles.errorText}>{errors.user_email}</span>}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Product</label>
                        <select 
                            name="product" 
                            value={formData.product} 
                            onChange={handleChange}
                            style={{...styles.select, ...(errors.product ? styles.inputError : {})}}
                        >
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        {errors.product && <span style={styles.errorText}>{errors.product}</span>}
                    </div>

                    <div style={styles.formRow}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Product Cost</label>
                            <input 
                                type="number" 
                                name="product_cost" 
                                value={formData.product_cost} 
                                readOnly
                                style={{...styles.input, ...styles.readOnly}}
                            />
                        </div>

                        <div style={styles.formGroup}>
                            <label style={styles.label}>Quantity</label>
                            <input 
                                type="number" 
                                name="quantity" 
                                value={formData.quantity} 
                                onChange={handleChange} 
                                min="1"
                                style={{...styles.input, ...(errors.quantity ? styles.inputError : {})}}
                            />
                            {errors.quantity && <span style={styles.errorText}>{errors.quantity}</span>}
                        </div>
                    </div>

                    <div style={styles.totalSection}>
                        <span style={styles.totalLabel}>Total Amount:</span>
                        <span style={styles.totalAmount}>Rs.{(formData.product_cost * formData.quantity).toFixed(2)}</span>
                    </div>

                    <button type="submit" style={styles.submitButton} className="submit-btn">
                        Submit Order
                    </button>

                    {message && (
                        <div style={{
                            ...styles.message,
                            ...(message.includes('successfully') ? styles.successMessage : 
                                message.includes('Error') ? styles.errorMessage : {})
                        }}>
                            {message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: '100vh',
        // background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    formCard: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        maxWidth: '600px',
        width: '100%',
        overflow: 'hidden'
    },
    header: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 30px',
        textAlign: 'center',
        color: '#ffffff'
    },
    title: {
        margin: '0 0 10px 0',
        fontSize: '28px',
        fontWeight: '600'
    },
    subtitle: {
        margin: 0,
        fontSize: '14px',
        opacity: 0.9
    },
    form: {
        padding: '40px 30px'
    },
    formGroup: {
        marginBottom: '24px',
        flex: 1
    },
    formRow: {
        display: 'flex',
        gap: '16px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        color: '#374151',
        fontSize: '14px',
        fontWeight: '500'
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '15px',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        outline: 'none',
        boxSizing: 'border-box'
    },
    select: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '15px',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        outline: 'none',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
        boxSizing: 'border-box'
    },
    inputError: {
        borderColor: '#ef4444'
    },
    readOnly: {
        backgroundColor: '#f9fafb',
        cursor: 'not-allowed'
    },
    errorText: {
        display: 'block',
        color: '#ef4444',
        fontSize: '13px',
        marginTop: '6px'
    },
    totalSection: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        marginBottom: '24px'
    },
    totalLabel: {
        fontSize: '16px',
        fontWeight: '500',
        color: '#374151'
    },
    totalAmount: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#667eea'
    },
    submitButton: {
        width: '100%',
        padding: '14px',
        fontSize: '16px',
        fontWeight: '600',
        color: '#ffffff',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    message: {
        marginTop: '20px',
        padding: '12px 16px',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '14px',
        fontWeight: '500'
    },
    successMessage: {
        backgroundColor: '#d1fae5',
        color: '#065f46'
    },
    errorMessage: {
        backgroundColor: '#fee2e2',
        color: '#991b1b'
    }
};

const cssStyles = `
    .submit-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
    }

    .submit-btn:active {
        transform: translateY(0);
    }

    input:focus, select:focus {
        border-color: #667eea !important;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    input::placeholder {
        color: #9ca3af;
    }
`;

export default OrderForm;