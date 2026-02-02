// ============= Verify.jsx =============
import { useEffect, useContext, useCallback } from 'react' 
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'

 const Verify = () => {
  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext)
  const [searchParams] = useSearchParams()

  const success = searchParams.get('success')
  const orderId = searchParams.get('orderId')

  const verifyPayment = useCallback(async () => {
    try {
      if (!token) return null

      const response = await axios.post(
        backendUrl + '/api/order/verifyStripe',
        { success, orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCartItems({})
        navigate('/order')
      } else {
        navigate('/cart')
      }
    } catch (error) {
      console.log(error)
      toast.error('Something went wrong');
    }
  }, [backendUrl, token, orderId, success, navigate, setCartItems])

  useEffect(() => {
    verifyPayment()
  }, [verifyPayment])

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Verifying your payment...</p>
      </div>
    </div>
  )
}
export default Verify;