/**
 * Example: How to use SEO Metadata API
 * 
 * This example shows how to:
 * 1. Update product metadata for better social sharing
 * 2. Generate share links with custom metadata
 * 3. Test the share link
 */

// ==========================================
// Example 1: Update Product Metadata
// ==========================================

const updateProductMetadata = async (productId, metadata) => {
  const response = await fetch('https://app-faix.vercel.app/api/product/update-metadata', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productId: productId,
      title: metadata.title,
      description: metadata.description,
      image: metadata.image,
    }),
  });
  
  const result = await response.json();
  console.log('✅ Metadata updated:', result);
  return result;
};

// Usage
updateProductMetadata('99:33:E2:00:00:00:02', {
  title: 'iPhone 15 Pro Max - Chính Hãng VN/A | FAI-X',
  description: 'iPhone 15 Pro Max mới 100%, giá tốt nhất thị trường. Bảo hành 12 tháng chính hãng Apple. Mở app để xem chi tiết!',
  image: 'https://app-faix.vercel.app/images/iphone-15-pro-max.jpg',
});

// ==========================================
// Example 2: Generate Share Link
// ==========================================

const generateShareLink = async (productId, options = {}) => {
  const response = await fetch('https://app-faix.vercel.app/api/product/generate-share-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productId: productId,
      ref: options.ref || null,
      userId: options.userId || null,
      metadata: options.metadata || {},
    }),
  });
  
  const result = await response.json();
  console.log('🔗 Share link generated:', result);
  return result;
};

// Usage
generateShareLink('99:33:E2:00:00:00:02', {
  ref: 'user123',
  userId: 'john_doe',
  metadata: {
    campaign: 'spring_sale_2025',
    source: 'email',
  },
});

// ==========================================
// Example 3: Full Workflow
// ==========================================

const createAndShareProduct = async () => {
  try {
    // Step 1: Update product metadata for SEO
    console.log('📝 Step 1: Updating product metadata...');
    await updateProductMetadata('99:33:E2:00:00:00:02', {
      title: 'iPhone 15 Pro Max 256GB - Titan Xanh | FAI-X',
      description: '🔥 iPhone 15 Pro Max chính hãng VN/A, mới 100%. Giá tốt nhất, bảo hành 12 tháng Apple. Tặng kèm ốp lưng + dán màn hình. Mở app ngay!',
      image: 'https://cdn.example.com/products/iphone-15-pro-max-blue.jpg',
    });
    
    // Step 2: Generate share link
    console.log('🔗 Step 2: Generating share link...');
    const shareData = await generateShareLink('99:33:E2:00:00:00:02', {
      ref: 'seller_john',
      userId: 'john123',
    });
    
    // Step 3: Share the link
    console.log('🎉 Done! Share this link:');
    console.log('Full link:', shareData.data.shareLink);
    console.log('Short link:', shareData.data.shortLink);
    
    // Test the link
    console.log('\n✅ Test links:');
    console.log('Preview on Facebook:', `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(shareData.data.shareLink)}`);
    console.log('Preview on Twitter:', `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(shareData.data.shareLink)}`);
    
    return shareData;
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// ==========================================
// Example 4: Batch Update Multiple Products
// ==========================================

const batchUpdateProducts = async (products) => {
  console.log(`📦 Updating ${products.length} products...`);
  
  const results = await Promise.all(
    products.map(product => 
      updateProductMetadata(product.id, {
        title: product.title,
        description: product.description,
        image: product.image,
      })
    )
  );
  
  console.log('✅ All products updated!');
  return results;
};

// Usage
const myProducts = [
  {
    id: '99:33:E2:00:00:00:01',
    title: 'MacBook Pro M3 - 16GB RAM | FAI-X',
    description: 'MacBook Pro M3 chip mới nhất, hiệu năng khủng. Bảo hành 12 tháng chính hãng Apple.',
    image: 'https://cdn.example.com/macbook-pro-m3.jpg',
  },
  {
    id: '99:33:E2:00:00:00:02',
    title: 'iPhone 15 Pro Max - Titan Xanh | FAI-X',
    description: 'iPhone 15 Pro Max chính hãng VN/A. Giá tốt nhất thị trường, bảo hành 12 tháng.',
    image: 'https://cdn.example.com/iphone-15.jpg',
  },
  {
    id: '99:33:E2:00:00:00:03',
    title: 'AirPods Pro Gen 2 - USB-C | FAI-X',
    description: 'AirPods Pro thế hệ 2 với cổng USB-C. Chống ồn chủ động ANC tuyệt vời.',
    image: 'https://cdn.example.com/airpods-pro-2.jpg',
  },
];

// batchUpdateProducts(myProducts);

// ==========================================
// Example 5: Get Product Statistics
// ==========================================

const getProductStats = async (productId) => {
  const response = await fetch(`https://app-faix.vercel.app/api/product/stats/${productId}`);
  const result = await response.json();
  
  console.log('📊 Product Statistics:');
  console.log('Product ID:', result.data.productId);
  console.log('Total Clicks:', result.data.totalClicks);
  console.log('Unique Users:', result.data.uniqueUsers);
  console.log('By Platform:', result.data.byPlatform);
  console.log('Recent Clicks:', result.data.recentClicks.slice(0, 3));
  
  return result;
};

// Usage
// getProductStats('99:33:E2:00:00:00:02');

// ==========================================
// Example 6: Testing Share Links
// ==========================================

const testShareLink = (productId) => {
  const baseUrl = 'https://app-faix.vercel.app';
  const shareUrl = `${baseUrl}/share?id=${productId}`;
  
  console.log('🧪 Testing share link:', shareUrl);
  console.log('\n📱 Test on different platforms:');
  console.log('1. Facebook:', `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(shareUrl)}`);
  console.log('2. Twitter:', `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(shareUrl)}`);
  console.log('3. LinkedIn:', `https://www.linkedin.com/post-inspector/?url=${encodeURIComponent(shareUrl)}`);
  console.log('4. WhatsApp:', `https://api.whatsapp.com/send?text=${encodeURIComponent(shareUrl)}`);
  console.log('5. Telegram:', `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`);
  
  console.log('\n💡 Copy and paste the share URL to test:');
  console.log(shareUrl);
};

// Usage
// testShareLink('99:33:E2:00:00:00:02');

// ==========================================
// Export for use in other files
// ==========================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateProductMetadata,
    generateShareLink,
    createAndShareProduct,
    batchUpdateProducts,
    getProductStats,
    testShareLink,
  };
}

// ==========================================
// Quick Test - Uncomment to run
// ==========================================

// (async () => {
//   console.log('🚀 Starting SEO Metadata Test...\n');
//   
//   // Test with a sample product
//   const testProductId = '99:33:E2:00:00:00:02';
//   
//   // 1. Update metadata
//   await updateProductMetadata(testProductId, {
//     title: 'Test Product - Amazing Deal | FAI-X',
//     description: 'This is a test product with custom SEO metadata. Click to see more!',
//     image: 'https://via.placeholder.com/1200x630/667eea/ffffff?text=FAI-X+Product',
//   });
//   
//   // 2. Generate share link
//   const shareData = await generateShareLink(testProductId, {
//     ref: 'test_user',
//   });
//   
//   // 3. Test the share link
//   console.log('\n✅ Test completed! Share link:');
//   console.log(shareData.data.shareLink);
//   
//   // 4. Show test URLs
//   testShareLink(testProductId);
// })();

