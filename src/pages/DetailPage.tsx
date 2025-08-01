import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Loader2, Eye, Heart, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";
import { Header } from "../components/layout/Header";

interface Portfolio {
  _id: string;
  title: string;
  description: string;
  imageUrls: string[];
  thumbnailUrl?: string;
  category: string;
  creator: {
    name: string;
    avatar: string;
  };
  viewsCount: number;
  likes: string[];
  likesCount: number;
  isLikedByUser: boolean;
}

const DetailPage = () => {
  const { id } = useParams();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/portfolios/${id}`);
      if (res.data?.success) {
        setPortfolio(res.data.data);
      } else {
        toast({
          title: "Error",
          description: res.data.message || "Failed to load portfolio.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong.",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin w-8 h-8 text-gray-600" />
      </div>
    );
  }

  if (!portfolio) {
    return <div className="text-center mt-10 text-red-500">Portfolio not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition text-sm"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">{portfolio.title}</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            {portfolio.imageUrls.length > 0 ? (
              portfolio.imageUrls.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Portfolio ${index + 1}`}
                  className="rounded-xl w-full object-cover max-h-[400px]"
                />
              ))
            ) : portfolio.thumbnailUrl ? (
              <img
                src={portfolio.thumbnailUrl}
                alt="Portfolio Thumbnail"
                className="rounded-xl w-full object-cover max-h-[400px]"
              />
            ) : (
              <p className="text-gray-400">No images available</p>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            {/* Creator */}
            <div className="flex items-center gap-4">
              <img
                src={portfolio.creator?.avatar}
                alt="Creator"
                className="w-12 h-12 rounded-full object-cover border"
              />
              <div>
                <p className="font-semibold text-gray-800">{portfolio.creator?.name}</p>
                <p className="text-sm text-gray-500">{portfolio.category}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-700 leading-relaxed">{portfolio.description}</p>

            {/* Stats */}
            <div className="flex gap-6 items-center text-gray-600 mt-2">
              <span className="flex items-center gap-1">
                <Eye className="w-5 h-5" /> {portfolio.viewsCount}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-5 h-5" /> {portfolio.likesCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
