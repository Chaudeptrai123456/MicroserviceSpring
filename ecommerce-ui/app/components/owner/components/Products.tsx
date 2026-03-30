import { UserContext } from "@/context/UserContext";
import { useContext, useEffect, useState, useCallback } from "react";
import { apiClient } from "@/utils/axios.client";
import { API_PATHS } from "@/utils/apiPaths";
import { Product } from "../../../../type";

import ProductsCreateTab from "../components/Products/Products.CreateTab";
import ProductUpdateTab from "../components/Products/Products.UpdateTab";

const backend = apiClient("BACKEND");
const gateway = apiClient("GATEWAY");

export default function Products() {
  const ctx = useContext(UserContext);
  if (!ctx) return null;

  const { user } = ctx;

  const [productList, setProductList] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const fetchProducts = useCallback(async () => {
    if (!user?.token) return;

    try {
      const res = await backend.get(API_PATHS.PRODUCT.GET_ALL, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        params: {
          page,
          size,
        },
      });

      setProductList(res.data.products);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  }, [user?.token, page, size]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const searchProducts = async () => {
    if (!user?.token) return;
    console.log(user?.token);
    console.log(API_PATHS.SEARCH.PRODUCT);
    try {
      const res = await gateway.post(
        API_PATHS.SEARCH.PRODUCT,
        {
          description: search,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );
      setProductList(res.data.result);
      console.log("test product " + JSON.stringify(productList));
      setTotalPages(1);
      setPage(0);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const handleSearch = () => {
    if (search.trim() === "") {
      fetchProducts();
    } else {
      searchProducts();
    }
  };

  const handleReset = () => {
    setSearch("");
    setPage(0);
    fetchProducts();
  };

  return (
    <div className="flex flex-col gap-6 h-full bg-gray-900 text-white p-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>

        <button
          className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={() => setOpenCreate(true)}
        >
          + Add Product
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="flex gap-3 items-center">
        <input
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 w-80 focus:outline-none focus:border-blue-500"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />

        <button
          className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={handleSearch}
        >
          Search
        </button>

        <button
          className="bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600 transition"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-gray-800 rounded-xl overflow-hidden shadow">
        <table className="w-full text-left">
          <thead className="bg-gray-700 text-sm uppercase">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Price</th>
              <th className="p-4">Description</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {productList.map((product) => (
              <tr
                key={product.id}
                className="border-t border-gray-700 hover:bg-gray-750 transition"
              >
                <td className="p-4 font-medium">{product.name}</td>

                <td className="p-4 text-green-400">${product.price}</td>

                <td className="p-4 text-gray-300">{product.description}</td>

                <td className="p-4 flex gap-4">
                  <button
                    className="text-blue-400 hover:underline"
                    onClick={() => {
                      setSelectedProduct(product);
                      setOpenUpdate(true);
                    }}
                  >
                    Edit
                  </button>

                  <button className="text-red-400 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {productList.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-8 text-gray-400">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}

      {search === "" && (
        <div className="flex justify-center items-center gap-4">
          <button
            className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-40"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>

          <span className="text-gray-300">
            Page {page + 1} / {totalPages}
          </span>

          <button
            className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-40"
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* CREATE MODAL */}

      {openCreate && (
        <Modal title="Create Product" onClose={() => setOpenCreate(false)}>
          <ProductsCreateTab
            onSuccess={() => {
              setOpenCreate(false);
              fetchProducts();
            }}
          />
        </Modal>
      )}

      {/* UPDATE MODAL */}

      {openUpdate && selectedProduct && (
        <Modal title="Update Product" onClose={() => setOpenUpdate(false)}>
          <ProductUpdateTab
            product={selectedProduct}
            onSuccess={() => {
              setOpenUpdate(false);
              fetchProducts();
            }}
          />
        </Modal>
      )}
    </div>
  );
}

type ModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-[90vw] md:w-[70vw] lg:w-[50vw] max-h-[90vh] flex flex-col shadow-xl">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold">{title}</h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 flex justify-center">
          <div className="w-full max-w-xl">{children}</div>
        </div>
      </div>
    </div>
  );
}
