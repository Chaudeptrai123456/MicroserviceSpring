import { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "@/context/UserContext";
import { apiClient } from "@/utils/axios.client";
import { API_PATHS } from "@/utils/apiPaths";
import { Category } from "../../../../../type";

const backend = apiClient("BACKEND");

type Props = {
  onSuccess?: () => void;
};

type Feature = {
  name: string;
  value: string;
};

export default function ProductsCreateTab({ onSuccess }: Props) {
  const ctx = useContext(UserContext);
  if (!ctx) return null;

  const { user } = ctx;
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [categoryId, setCategoryId] = useState("");

  const [features, setFeatures] = useState<Feature[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [featureName, setFeatureName] = useState("");
  const [featureValue, setFeatureValue] = useState("");
  const [avgCost, setAvgCost] = useState<number>(0);
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // LOAD CATEGORY
  useEffect(() => {
    if (!user?.token) return;

    const fetchCategories = async () => {
      try {
        const res = await backend.get(API_PATHS.CATEGORY.GET_ALL, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        setCategories(res.data);
      } catch (err) {
        console.error("Load categories error", err);
      }
    };

    fetchCategories();
  }, [user]);

  // ADD FEATURE
  const handleAddFeature = () => {
    if (!featureName.trim() || !featureValue.trim()) return;

    setFeatures([
      ...features,
      {
        name: featureName.trim(),
        value: featureValue.trim(),
      },
    ]);

    setFeatureName("");
    setFeatureValue("");
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  // IMAGE UPLOAD
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);

    setImages(files);

    const previews = files.map((file) => URL.createObjectURL(file));

    setPreviewImages(previews);
  };

  const handleRemoveImages = () => {
    if (!confirm("Remove all images?")) return;

    setImages([]);
    setPreviewImages([]);
  };

  const handleReUpload = () => {
    fileInputRef.current?.click();
  };

  // CREATE PRODUCT
  const handleCreate = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      setSuccessMsg("");

      const token = user?.token;

      const res = await backend.post(
        API_PATHS.WAREHOUSE.CREATE_PRODUCT,
        {
          name,
          description,
          price,
          avgCost,
          quantity,
          categoryId,
          features,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const productId = res.data.id;

      // upload images
      if (images.length > 0) {
        const formData = new FormData();

        images.forEach((file) => {
          formData.append("images", file);
        });

        await backend.post(API_PATHS.PRODUCT.ADD_IMAGE(productId), formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setSuccessMsg("✅ Product created successfully!");

      onSuccess?.();
    } catch (err) {
      console.error("Create product error", err);
      setErrorMsg("❌ Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label>Name</label>
        <input
          className="border p-2 w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label>Description</label>
        <textarea
          className="border p-2 w-full"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div>
        <label>Average Cost</label>
        <input
          type="number"
          className="border p-2 w-full"
          value={avgCost}
          onChange={(e) => setAvgCost(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Price</label>
        <input
          type="number"
          className="border p-2 w-full"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
      </div>

      <div>
        <label>Quantity</label>
        <input
          type="number"
          className="border p-2 w-full"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      {/* CATEGORY */}
      <div>
        <label>Category</label>

        <select
          className="border p-2 w-full bg-black"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Select category</option>

          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* FEATURES */}
      <div className="flex flex-col gap-2">
        <label>Features</label>

        <div className="flex gap-2">
          <input
            className="border p-2 w-1/3"
            value={featureName}
            onChange={(e) => setFeatureName(e.target.value)}
            placeholder="Name"
          />

          <input
            className="border p-2 w-full"
            value={featureValue}
            onChange={(e) => setFeatureValue(e.target.value)}
            placeholder="Value"
          />

          <button
            type="button"
            onClick={handleAddFeature}
            className="px-3 bg-blue-600 text-white rounded"
          >
            Add
          </button>
        </div>

        {features.map((feature, index) => (
          <div
            key={index}
            className="flex justify-between bg-gray-700 px-3 py-2 rounded"
          >
            <span>
              <strong>{feature.name}</strong> : {feature.value}
            </span>

            <button
              onClick={() => handleRemoveFeature(index)}
              className="text-red-400"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* IMAGE UPLOAD */}

      <div className="flex flex-col gap-2">
        <label>Upload Images</label>

        {previewImages.length === 0 ? (
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700">
            Click to upload
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              {previewImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  className="w-full h-24 object-cover rounded"
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReUpload}
                className="px-3 py-1 bg-yellow-600 text-white rounded"
              >
                Replace
              </button>

              <button
                onClick={handleRemoveImages}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Remove
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
          </>
        )}
      </div>

      <button
        className="bg-green-600 hover:bg-green-700 text-white py-2 rounded mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
        onClick={handleCreate}
        disabled={loading}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        )}

        {loading ? "Creating..." : "Create Product"}
      </button>
      {successMsg && (
        <div className="bg-green-600 text-white p-2 rounded">{successMsg}</div>
      )}

      {errorMsg && (
        <div className="bg-red-600 text-white p-2 rounded">{errorMsg}</div>
      )}
    </div>
  );
}
