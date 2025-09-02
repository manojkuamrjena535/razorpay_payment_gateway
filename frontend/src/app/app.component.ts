import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface VerifyPaymentResponse {
  status: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  amount: number = 100;
  currency: string = 'INR';
  userId: string = 'user123';

  constructor(private http: HttpClient) { }
  async loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  async payNow() {
    const loaded = await this.loadRazorpayScript();
    if (!loaded) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    // Step 1: Create order from backend
    const order = await this.http.post<any>(
      'http://localhost:3000/api/payment/create-order',
      {
        amount: this.amount,
        currency: this.currency,
        userId: this.userId
      }
    ).toPromise();

    if (!order || !order.id) {
      alert('Failed to create order');
      return;
    }

    // Step 2: Razorpay checkout options
    const options = {
      key: 'rzp_test_RCek95cdSqMMP2', // Replace with your key_id
      amount: order.amount, // in paise
      currency: order.currency,
      name: 'MyApp Payment',
      order_id: order.id,
      handler: async (response: any) => {
        console.log('Razorpay response:', response);

        const payload = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          userId: this.userId
        };

        console.log('Sending verify payload:', payload);

        try {
          const verify = await this.http.post<{ status: string }>(
            'http://localhost:3000/api/payment/verify-payment',
            payload
          ).toPromise();

          alert(`Payment ${verify?.status}`);
        } catch (err) {
          console.error('Verification error:', err);
          alert('Payment verification failed. See console for details.');
        }
      },
      theme: { color: '#3399cc' }
    };

    // Step 3: Open Razorpay checkout
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

}