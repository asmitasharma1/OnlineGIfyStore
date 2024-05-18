import React, { useState, useEffect } from 'react';
import './ListProduct.css';
import cross_icon from '../../assets/cross_icon.png';

const ListProduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [sortOption, setSortOption] = useState('date_added');

  const fetchInfo = async () => {
    await fetch(`http://localhost:4000/allproducts`)
      .then((res) => res.json())
      .then((data) => {
        let sortedData = data.slice(); // Create a copy of the data array
        switch (sortOption) {
          case 'date_added':
            sortedData.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
          case 'name':
            sortedData.sort((a, b) => a.name.localeCompare(b.name));
            break;
          case 'price':
            sortedData.sort((a, b) => a.new_price - b.new_price);
            break;
          default:
            break;
        }
        setAllProducts(data);
        setSortedProducts(sortedData);
      });
  };

  useEffect(() => {
    fetchInfo();
  }, [sortOption]);

  const removeProduct = async (id) => {
    await fetch('http://localhost:4000/removeproduct', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json'
      },
      body: JSON.stringify({ id: id })
    });
    await fetchInfo();
  };

  return (
    <div className='list-product'>
      <h1>All Products List</h1>
      <div className="sort-button-container">
        <label htmlFor="sort">Sort by:</label>
        <select id="sort" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="date_added">Recently Added</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
        </select>
      </div>

      <div className="listproduct-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {sortedProducts.map((product) => {
          return (
            <div key={product.id} className="listproduct-format-main listproduct-format">
              <div className="productimage">
                <img className="listproduct-product-icon" src={product.image} alt="" />
              </div>
              <p>{product.name}</p>
              <p>Rs.{product.old_price}</p>
              <p>Rs.{product.new_price}</p>
              <p>{product.category}</p>
              <img onClick={() => { removeProduct(product.id) }} className='listproduct-remove-icon' src={cross_icon} alt="" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ListProduct;
