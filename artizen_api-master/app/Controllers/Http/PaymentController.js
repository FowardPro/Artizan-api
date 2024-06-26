'use strict'

const Payment = use('App/Models/Payment');

class PaymentController {
    async index ({ response }) {
        try {
          const payment = await Payment.all()
    
          return response.json(payment)
        } catch (error) {
          console.error('Error fetching payment:', error.message)
          return response.status(500).json({ error: 'Failed to fetch payment' })
        }
    }

    async findById ({ params, response }) {
        try {
          const payment = await Payment.find(params.id);

          if (!payment) {
            return response.status(404).json({ error: 'Payment not found' })
          }    
          return response.json(payment)
        } catch (error) {
          console.error('Error fetching payment:', error.message)
          return response.status(500).json({ error: 'Failed to fetch payment' })
        }
    }

    async findByUserId ({ params, response }) {
      try {
        const payments = await Payment.query().where('user_id', params.id).fetch();

        if (!payments) {
          return response.status(404).json({ error: 'Payments not found' })
        }    

        return response.json(payments)
      } catch (error) {
        return response.status(500).json({ error: 'Failed to fetch payments' })
      }
  }

    async update({ params, response }) {
        try {
          const payment = await Payment.find(params.id);
          if (!payment) {
            return response.status(404).json({ error: 'Payment not found' })
          }    
          
          return response.json(payment)
        } catch (error) {
          console.error('Error fetching payment:', error.message)
          return response.status(500).json({ error: 'Failed to fetch payment' })
        }
    }
}

module.exports = PaymentController
