import React, {useState, useEffect} from 'react'
import Navbar from './components/Navbar'
import DropdownCategories from './components/DropdownCategories'
import Catalog from './components/Catalog'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SearchBar from './components/SearchBar';

function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [userRole, setUserRole] = useState("admin")
  const [dataProduct, setDataProduct] = useState([]);
  const [dataCategory, setDataCategory] = useState([]);
  const [dataCart, setDataCart] = useState();
  const [onSearch, setOnSearch] = useState(false);
  const [productExist, setProductExist] = useState(false);

  useEffect(() => {
    const load = async () => {
      try{
        const verifyToken = await axios.get("https://toko369-be-production.up.railway.app/api/auth/verifyUser", {withCredentials: true});
        setUserRole(verifyToken.data.role);
        try{
          const loadDataProduct = await axios.get("https://toko369-be-production.up.railway.app/api/product/fetch/status", {withCredentials: true});
          setDataProduct(loadDataProduct.data);
          const loadDataCategory = await axios.get("https://toko369-be-production.up.railway.app/api/category/fetch", {withCredentials: true});
          setDataCategory(loadDataCategory.data);
          const loadDataCart = await axios.get("https://toko369-be-production.up.railway.app/api/cart/fetch", {withCredentials: true});
          setDataCart(loadDataCart.data);
        }
        catch (e){
          alert("Error while fetching ada: " + e.response.data.message);
        }
      }
      catch (e){
        alert(e.response.data.message + " Silahkan login terlebih dahulu!");
        navigate('/')
      }
    }
    load();

  }, []);

  return (
    <div>
      <Navbar setSearchQuery={setSearchQuery} setSelectedCategory={setSelectedCategory} selectedCategory={selectedCategory} setOnSearch={setOnSearch} userRole={userRole}/>
      <SearchBar setSearchQuery={setSearchQuery} setSelectedCategory={setSelectedCategory} selectedCategory={selectedCategory} setOnSearch={setOnSearch}/>
      {productExist && <DropdownCategories setSelectedCategory={setSelectedCategory} selectedCategory={selectedCategory} dataCategory={dataCategory}/>}
      <Catalog searchQuery={searchQuery} selectedCategory={selectedCategory} dataProduct={dataProduct} setOnSearch={setOnSearch} onSearch={onSearch} setProductExist={setProductExist}/>
    </div>
  )
}

export default HomePage
