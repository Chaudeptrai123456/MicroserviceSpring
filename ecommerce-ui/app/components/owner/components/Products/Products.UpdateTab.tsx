import { useContext, useState, useEffect, useRef } from "react";
import { UserContext } from "@/context/UserContext";
import { apiClient } from "@/utils/axios.client";
import { API_PATHS } from "@/utils/apiPaths";
import { Product } from "../../../../../type";
import { ProductImage } from "../../../../../type";
const backend = apiClient("BACKEND");

type Props = {
  product: Product;
  onSuccess?: () => void;
};
type Feature = {
  name: string;
  value: string;
};
export default function ProductUpdateTab({ product, onSuccess }: Props) {
  const ctx = useContext(UserContext);
  if (!ctx) return null;

  const { user } = ctx;
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [features, setFeatures] = useState<Feature[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<(ProductImage | string)[]>(
    [],
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [featureName, setFeatureName] = useState("");
  const [featureValue, setFeatureValue] = useState("");
  useEffect(() => {
    if (!product) return;
    console.log(product.id);
    console.log("Load product to update form", product.category);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description);
    setQuantity(product.quantity);
    setCategoryId(product.category.name);
    setFeatures(product.features || []);

    setPreviewImages(product.images || []);
  }, [product]);
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
  const handleUpdate = async () => {
    try {
      setLoading(true);
      setSuccessMsg("");
      setErrorMsg("");

      const token = user?.token;

      await backend.post(
        API_PATHS.PRODUCT.UPDATE(product.id),
        {
          name,
          price,
          description,
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

      // upload images
      if (images.length > 0) {
        const formData = new FormData();

        images.forEach((file) => {
          formData.append("images", file);
        });

        await backend.post(API_PATHS.PRODUCT.ADD_IMAGE(product.id), formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setSuccessMsg("✅ Product updated successfully!");

      onSuccess?.();
    } catch (err) {
      console.error("Update product error", err);
      setErrorMsg("❌ Failed to update product");
    } finally {
      setLoading(false);
    }
  };
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
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Product Name</label>
        <input
          className="border border-gray-700 bg-gray-800 rounded p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Price</label>
        <input
          type="number"
          className="border border-gray-700 bg-gray-800 rounded p-2"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Quantity</label>
        <input
          type="number"
          className="border border-gray-700 bg-gray-800 rounded p-2"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Category ID</label>
        <input
          className="border border-gray-700 bg-gray-800 rounded p-2"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-gray-400">Description</label>
        <textarea
          className="border border-gray-700 bg-gray-800 rounded p-2"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400">Features</label>

        <div className="flex gap-2">
          <input
            className="border border-gray-700 bg-gray-800 rounded p-2 w-1/3"
            value={featureName}
            onChange={(e) => setFeatureName(e.target.value)}
            placeholder="Name (ex: chipset)"
          />

          <input
            className="border border-gray-700 bg-gray-800 rounded p-2 w-full"
            value={featureValue}
            onChange={(e) => setFeatureValue(e.target.value)}
            placeholder="Value (ex: AMD Ryzen 9 8945HS)"
          />

          <button
            type="button"
            onClick={handleAddFeature}
            className="px-3 bg-blue-600 text-white rounded"
          >
            Add
          </button>
        </div>

        {/* FEATURE LIST */}

        <div className="flex flex-col gap-2 mt-2">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-700 px-3 py-2 rounded"
            >
              <span>
                <strong>{feature.name}</strong> : {feature.value}
              </span>

              <button
                type="button"
                onClick={() => handleRemoveFeature(index)}
                className="text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

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
                  src={typeof img === "string" ? img : img.url}
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
        onClick={handleUpdate}
        disabled={loading}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        )}

        {loading ? "Updating..." : "Update Product"}
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
