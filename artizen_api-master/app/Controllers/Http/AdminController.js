'use strict'

const Artwork = use('App/Models/Artwork')

class AdminController {
  async approveArtwork({ params, response }) {
    try {
      const artwork = await Artwork.find(params.id)
      if (!artwork) {
        return response.status(404).json({ error: 'Artwork not found' })
      }
      artwork.status = 'approved'
      await artwork.save()
      return response.status(200).json(artwork)
    } catch (error) {
      console.error('Error approving artwork:', error.message)
      return response.status(500).json({ error: 'Failed to approve artwork' })
    }
  }

  async rejectArtwork({ params, response }) {
    try {
      const artwork = await Artwork.find(params.id)
      if (!artwork) {
        return response.status(404).json({ error: 'Artwork not found' })
      }
      artwork.status = 'rejected'
      await artwork.save()
      return response.status(200).json(artwork)
    } catch (error) {
      console.error('Error rejecting artwork:', error.message)
      return response.status(500).json({ error: 'Failed to reject artwork' })
    }
  }
}

module.exports = AdminController
