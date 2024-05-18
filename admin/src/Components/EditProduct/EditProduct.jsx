import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const EditProduct = () => {
  const { id } = useParams();
  const [productDetails, setProductDetails] = useState({
    name: '',
    image: '',
    category: '',
    new_price: '',
    old_price: ''
  });

  useEffect(() => {
    const fetchProduct = async () => {
      const response = await fetch(`http://localhost:4000/product/${id}`);
      const data = await response.json();
      setProductDetails(data);
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductDetails({ ...productDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch(`http://localhost:4000/updateproduct/${id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
      body: JSON.stringify(productDetails),
    });
    // Handle success or error
  };

  return (
    <div>
      <h1>Edit Product</h1>
      <form onSubmit={handleSubmit}>
        <label>Name:</label>
        <input type="text" name="name" value={productDetails.name} onChange={handleChange} />
        <label>Image:</label>
        <input type="text" name="image" value={productDetails.image} onChange={handleChange} />
        <label>Category:</label>
        <input type="text" name="category" value={productDetails.category} onChange={handleChange} />
        <label>New Price:</label>
        <input type="text" name="new_price" value={productDetails.new_price} onChange={handleChange} />
        <label>Old Price:</label>
        <input type="text" name="old_price" value={productDetails.old_price} onChange={handleChange} />
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

export default EditProduct;
