import React, { useState, ChangeEvent, FormEvent } from 'react';
import { storage } from '@/firebaseconfig'; // Adjust the import path as needed
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from 'next/image';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
// import Image from 'next/image'

interface Product {
  image: string;
  link: string;
  price: number;
  title: string;
  rating: string;
  pid: string;
}

interface TryonProps {
  products: Product[];
}


// products = [
//     {
//       "product": "Graphic Tee - Vintage Style",
//       "results": [
//           {
//               "image": "https://i5.walmartimages.com/seo/Vintage-Style-Mardi-Gras-Graphic-Design-Ring-Spun-Combed-Cotton-Short-Sleeve-Deluxe-Jersey-T-Shirt-White-2XL_42e5bb45-7929-44da-bcb6-0565875b74d1.23b9e4588c74b0db4d2ec6cb877c1127.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/Vintage-Style-Mardi-Gras-Graphic-Design-Ring-Spun-Combed-Cotton-Short-Sleeve-Deluxe-Jersey-T-Shirt-White-2XL/5272992755",
//               "pid": "2CPWQFSHESQ2",
//               "price": 23.99,
//               "rating": 0,
//               "title": "Vintage Style Mardi Gras Graphic Design Ring Spun Combed Cotton Short Sleeve Deluxe Jersey T-Shirt - White 2XL"
//           },
//           {
//               "image": "https://i5.walmartimages.com/seo/Smartprints-Mens-Graphic-Tee-Circus-Retro-Vintage-Logo-Regular-Fit-100-Cotton_1f25cd02-498f-455c-bbbb-25032486436a_1.c20711fb679b6759a43851b2a26bf27e.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/Smartprints-Mens-Graphic-Tee-Circus-Retro-Vintage-Logo-Regular-Fit-100-Cotton/193507286",
//               "pid": "594N8UAZ34JP",
//               "price": 15.99,
//               "rating": 0,
//               "title": "Smartprints Mens Graphic Tee - Circus Retro Vintage Logo - Regular Fit 100% Cotton"
//           },
//           {
//               "image": "https://i5.walmartimages.com/seo/YenGaKKD-Men-Women-Birthday-Anniversary-T-shirts-1964-1974-1984-Family-Party-Cotton-T-Shirt-Short-Sleeve-Tshirt-Vintage-Tee-Gift-Clothes-Rock-Band-Gr_555256cf-d2c6-4b03-a70a-8bc29328bb32.e4a338051f73464dbd3b60fb7a412f95.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/YenGaKKD-Men-Women-Birthday-Anniversary-T-shirts-1964-1974-1984-Family-Party-Cotton-T-Shirt-Short-Sleeve-Tshirt-Vintage-Tee-Gift-Clothes-Rock-Band-Gr/6205351991",
//               "pid": "64QKYIYHX3T4",
//               "price": 15.91,
//               "rating": 0,
//               "title": "YenGaKKD Men Women Birthday Anniversary T-shirts 1964 1974 1984 Family Party Cotton T Shirt Short Sleeve Tshirt Vintage Tee Gift Clothes Rock Band Graphic Print Custom Tshirt Black 100% Cotton Novelty"
//           }
//       ]
//   },
//   {
//       "product": "Motivational Quote T-Shirt",
//       "results": [
//           {
//               "image": "https://i5.walmartimages.com/seo/XCHQRTI-Women-Plus-Size-Hocus-Pocus-Shirt-Graphic-Halloween-Casual-Letter-T-Shirt-Short-Sleeve-Quote-Funny-Saying-Top-Tees_62891ebf-d9ad-44ab-9314-beff2880fe9b.18726d15910549e8cce8483835495ef4.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/XCHQRTI-Women-Plus-Size-Hocus-Pocus-Shirt-Graphic-Halloween-Casual-Letter-T-Shirt-Short-Sleeve-Quote-Funny-Saying-Top-Tees/2400567800?athbdg=L1600",
//               "pid": "5ICCXBPRKXQD",
//               "price": 14.99,
//               "rating": 0,
//               "title": "XCHQRTI Women Plus Size Hocus Pocus Shirt Graphic Halloween Casual Letter T-Shirt Short Sleeve Quote Funny Saying Top Tees"
//           },
//           {
//               "image": "https://i5.walmartimages.com/seo/Wild-Bobby-Uninterested-in-Opinion-Schitt-s-David-Quote-Pop-Culture-Men-Graphic-Tee-Charcoal-Small_3ea07a3d-4348-490a-87cb-f6507779eb92.e2eb41c341c85558f129bd11e6186691.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/Wild-Bobby-Uninterested-in-Opinion-Schitt-s-David-Quote-Pop-Culture-Men-Graphic-Tee-Charcoal-Small/846761035",
//               "pid": "4GX3I27R6PJL",
//               "price": 19.99,
//               "rating": 0,
//               "title": "Wild Bobby, Uninterested in Opinion Schitt's David Quote, Pop Culture, Men Graphic Tee, Charcoal, Small"
//           },
//           {
//               "image": "https://i5.walmartimages.com/seo/Dreams-Dont-Work-T-Shirt-Motivational-Quote-Black-Tee-Gift_8dfe1c3f-4131-47b4-ab39-1b52113d8a92.9a59eedd309bebb084a14e4b756b7d51.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/Dreams-Dont-Work-T-Shirt-Motivational-Quote-Black-Tee-Gift/319872195",
//               "pid": "5ACJI35I8RV7",
//               "price": 19.99,
//               "rating": 0,
//               "title": "Dreams Dont Work T-Shirt | Motivational Quote Black Tee Gift"
//           }
//       ]
//   },
//   {
//       "product": "Floral Print T-Shirt",
//       "results": [
//           {
//               "image": "https://i5.walmartimages.com/seo/VERABENDI-Womens-Tunic-Top-Plus-Size-Short-Sleeve-Floral-Printed-Button-V-Neck-Henley-Shirt-Ladies-Blouse-M-4X_a1f37e7f-c6a4-45a1-babb-02fe041a233f.c1a17e7357e32ec4cb27567921e0002d.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/VERABENDI-Womens-Tunic-Top-Plus-Size-Short-Sleeve-Floral-Printed-Button-V-Neck-Henley-Shirt-Ladies-Blouse-M-4X/280081001",
//               "pid": "2CRRVZDLFFJX",
//               "price": 22.99,
//               "rating": 5,
//               "title": "VERABENDI Womens Tunic Top Plus Size Short Sleeve Floral Printed Button V-Neck Henley Shirt Ladies Blouse (M-4X)"
//           },
//           {
//               "image": "https://i5.walmartimages.com/seo/Agnes-Orinda-Women-s-Plus-Size-Summer-Tops-Outfit-Ditsy-Colorful-Tie-Floral-Wrap-Blouses_5ae08cbf-b6c6-4ee7-9623-29288eba38dc.fcb6dcc884405fb1b09d89494fd36f06.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/Agnes-Orinda-Women-s-Plus-Size-Summer-Tops-Outfit-Ditsy-Colorful-Tie-Floral-Wrap-Blouses/5472526033",
//               "pid": "2H7CTZRQCH3T",
//               "price": 26.99,
//               "rating": 0,
//               "title": "Agnes Orinda Women's Plus Size Summer Tops Outfit Ditsy Colorful Tie Floral Wrap Blouses"
//           },
//           {
//               "image": "https://i5.walmartimages.com/seo/LARACE-Womens-Tunic-Tops-3-4-Roll-Sleeve-Floral-Printed-Round-Neck-Blouses-Long-Sleeve-Shirts-for-Women-WineRed-1X_e6771337-1f11-44ef-beee-baecf864f945.e03c84768fe51daf310624d35e8b339d.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/LARACE-Womens-Tunic-Tops-3-4-Roll-Sleeve-Floral-Printed-Round-Neck-Blouses-Long-Sleeve-Shirts-for-Women-WineRed-1X/3002133327",
//               "pid": "3UELTQJ9EEI9",
//               "price": 19.98,
//               "rating": 0,
//               "title": "LARACE Womens Tunic Tops 3/4 Roll Sleeve Floral Printed Round Neck Blouses Long Sleeve Shirts for Women WineRed 1X"
//           }
//       ]
//   },
//   {
//       "product": "Abstract Art Tee",
//       "results": []
//   }
// ]

const Tryon: React.FC<TryonProps> = ({ products }) => {

const [image, setImage] = useState<File | null>(null);
const [imageUrl, setImageUrl] = useState<string>('');
const [selectedProductUrl, setSelectedProductUrl] = useState<string>('');
const [resultImage , setResultImage] = useState<string>('');
const [isLoading , setIsLoading] = useState(false);

  const handleImageUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!image) return;

    const imageRef = ref(storage, `images/${image.name}`);
    try {
      await uploadBytes(imageRef, image);
      const url = await getDownloadURL(imageRef);
      setImageUrl(url);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error("Error uploading image: ", error);
      alert('Failed to upload image.');
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleProductClick = (productUrl: string) => {
    const cleanedUrl = productUrl.split('?')[0];

    console.log(cleanedUrl);
    setSelectedProductUrl(cleanedUrl);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageUrl || !selectedProductUrl) {
      alert('Please upload an image and select a product.');
      return;
    }

    // const requestBody = {
    //   userImageUrl: "https://i5.walmartimages.com/seo/Athletic-Works-Men-s-Fleece-Full-Zip-Hoodie-Jacket_f75cb628-2463-4d5e-b906-e11ad8196b55.c760c7c06748eeae398ffdd2b8b3d8e8.jpeg",
    //   productImageUrl: selectedProductUrl,
    // };

    // Make your API call here with requestBody
    // console.log('Request Body:', requestBody);
    // alert('API call can be made with the request body.');
  };


  const clothtry = async() =>{
setIsLoading(true);
    try {
      const response = await fetch(' http://127.0.0.1:8000/virtual-try-on' , {
        method : 'POST',
        headers : {
          'Content-type' : 'application/json',
        },
        body : JSON.stringify({
          avatar_image_url: "https://iili.io/dEeBgkX.md.jpg",
          clothing_image_url: selectedProductUrl,
        })
      })

      
      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data = await response.json();
      setResultImage(`data:${data.content_type};base64,${data.image}`);
    } catch (error) {
      console.error('Error calling virtual try-on API:', error);

    }

    setIsLoading(false);
  }
  

  return (
    <div className="overflow-y-scroll min-h-screen max-h-screen h-full p-2   mb-6">
      <p className='text-base font-semibold'>Virtual Try-on</p>
      <p className='text-sm text-gray-400'>Offline-store like experience, try clothes and share it with anyone.</p>

      <div className='flex flex-col my-6 gap-4'>
        {/* select dress section */}
        <div>
          <p className='text-base font-semibold'>1) Select the dress you want to try:</p>
          <div className="flex overflow-x-auto space-x-4 mt-2">
            {/* Render your products here */}
            {products.map((product) => (
              <div key={product.pid} className={`flex-shrink-0 cursor-pointer p-2 rounded-md ${selectedProductUrl === product.image.split('?')[0] ? 'bg-blue-200' : 'bg-white'}`} onClick={() => handleProductClick(product.image)}>
                                <p className='text-[15px] font-semibold '>{product.title.length > 12 ? product.title.substring(0, 12) + '..' : product.title}</p>
                                <Image src={product.image} alt={product.title} width={130} height={130} />
              </div>
            ))}
          </div>
        </div>

        {/* upload your pic section */}
        <form className='flex flex-col mt-4' onSubmit={handleImageUpload}>
          <p className='text-base font-semibold'>2) Upload your picture:</p>
          <input
            type="file"
            name="look_image"
            id="img"
            accept="image/*"
            className='mt-1 file:rounded-md file:p-1 file:text-sm file:font-medium file:hover:cursor-pointer file:border-none file:shadow-sm file:bg-primary file:px-3 file:py-2 file:text-white'
            onChange={handleImageChange}
          />
          <Button type="submit" className='mt-3'>Upload</Button>
        </form>

        {/* {imageUrl && (
          <div className='mt-4'>
            <p className='text-base font-sm'>Uploaded Image:</p>
            <Image src={imageUrl} alt="Uploaded" className='mt-2 rounded-md' height={20} width={20} />
          </div>
        )} */}


        <Button onClick={clothtry} className='mb-24'>Create your look</Button>
        
        {isLoading ? <div className='flex flex-col items-center mb-32 gap-8'>
<p className='font-bold text-lg'> Generating your look ..</p>
<Spinner size="small" />
</div> : null}



        {/* <div className='flex flex-col items-center'>
        <p className='font-bold text-lg'>Result</p>
        <Image src={resultImage} alt="Try-on Result" className='mt-2 rounded-md' width={200} height={200} />
        </div> */}

        {resultImage ?   <div className='flex flex-col items-center mb-32'>
        <p className='font-bold text-lg'>Result</p>
        <Image src={resultImage} alt="Try-on Result" className='mt-2 rounded-md' width={200} height={200} />
        </div> : null }

        
       
        </div>
    </div>
  );
}

export default Tryon;
