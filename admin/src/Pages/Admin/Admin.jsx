import React from 'react'
import Sidebar from '../../Components/Sidebar/Sidebar'
import './Admin.css'
import { Routes, Route } from 'react-router-dom'
import AddProduct from '../../Components/AddProduct/AddProduct'
import ListProduct from '../../Components/ListProduct/ListProduct'
import EditProduct from '../../Components/EditProduct/EditProduct'
import Dashboard from '../../Components/Dashboard/Dashboard'

const Admin = () => {
  return (
    <div className='admin'>
      <Sidebar />
      <Routes>
       <Route path='/dashboard' element={<Dashboard/>} /> 
        <Route path='/addproduct' element={<AddProduct />} />
        <Route path='/listproduct' element={<ListProduct />} />
        <Route path="/editproduct/:id" element={<EditProduct />} />

        <Route path='/editproduct' element={<EditProduct />} />
      </Routes>
    </div>
  )
}

export default Admin