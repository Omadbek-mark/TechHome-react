import axios from 'axios';
import { api } from '../../lib/api/client';
import { serverApi } from '../../lib/config';
import { Product, ProductInquiry, ProductPage } from '../../lib/types/product';
import { catalogSearch } from '../../lib/catalog/query';

class ProductService {
  public async getProducts(input: ProductInquiry): Promise<Product[]> {
    return (await axios.get(`${serverApi}/product/all${catalogSearch(input)}`)).data;
  }
  public async getCatalog(input: ProductInquiry): Promise<ProductPage> {
    return (await axios.get(`${serverApi}/product/catalog${catalogSearch(input)}`)).data;
  }
  public async getProduct(productId: string): Promise<Product> {
    return (await api.get(`${serverApi}/product/${encodeURIComponent(productId)}`, { withCredentials: true })).data;
  }
}
export default ProductService;
