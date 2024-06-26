'use strict'

const Artwork = use('App/Models/Artwork');
const Payment = use('App/Models/Payment');
const User = use('App/Models/User');
const Helpers = use('Helpers');
const path = require('path');
const fs = require('fs');
const Mail = use('Mail');

class ArtworkController {
  async index({ response }) {
    try {
      const artworks = await Artwork.all();
      const artworksJSON = artworks.toJSON();

      const artworksWithImages = await Promise.all(artworksJSON.map(async (artwork) => {
        const filePath = path.join(Helpers.publicPath('uploads/artworks'), artwork.picture);

        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath);
          const base64Image = fileBuffer.toString('base64');
          return {
            ...artwork,
            picture: base64Image
          };
        } else {
          return artwork;
        }
      }));

      return response.json(artworksWithImages);
    } catch (error) {
      console.error('Error fetching artworks:', error.message);
      return response.status(500).json({ error: 'Failed to fetch artworks' });
    }
  }

  async findById({ params, response }) {
    try {

      const artwork = await Artwork.find(params.id)

      if (!artwork) {
        return response.status(404).json({ error: 'Artwork not found' })
      }
      const filePath = path.join(Helpers.publicPath('uploads/artworks'), artwork.picture);

      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);

        const base64Image = fileBuffer.toString('base64');

        const artworkWithImage = {
          ...artwork.toJSON(),
          picture: base64Image
        };

        return response.json(artworkWithImage);
      }
    } catch (error) {
      // Handle errors
      console.error('Error fetching artwork by ID:', error.message)
      return response.status(500).json({ error: 'Failed to fetch artwork' })
    }
  }

  async pending({ params, response }) {
    try {

      const artwork = await Artwork.query().where('status', 'approved').fetch();

      if (!artwork) {
        return response.status(404).json({ error: 'Artwork not found' })
      }
      const filePath = path.join(Helpers.publicPath('uploads/artworks'), artwork.picture);

      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);

        const base64Image = fileBuffer.toString('base64');

        const artworkWithImage = {
          ...artwork.toJSON(),
          picture: base64Image
        };

        return response.json(artworkWithImage);
      }
    } catch (error) {
      // Handle errors
      console.error('Error fetching artwork by ID:', error.message)
      return response.status(500).json({ error: 'Failed to fetch artwork' })
    }
  }

  async findByArtistId({ params, response }) {
    try {
        const artistId = params.id;

        const artworks = await Artwork.query().where('artist_id', artistId).fetch();
        const user = await User.query().where('id', artistId).first();

        if (artworks.rows.length === 0) {
          return response.status(404).json({ error: 'No artworks found for the given artist ID' });
        }

          // Convert artworks to JSON
        const artworksJSON = artworks.toJSON();

        // Add image data to artworks
        const artworksWithImages = await Promise.all(artworksJSON.map(async (artwork) => {
          const filePath = path.join(Helpers.publicPath('uploads/artworks'), artwork.picture);

          if (fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath);
            const base64Image = fileBuffer.toString('base64');
            return {
              ...artwork,
              picture: base64Image
            };
          } else {
            return artwork;
          }
        }));

        // Prepare the result object
        const result = {
          artworks: artworksWithImages,
          user: user ? user.toJSON() : null
        };
    return response.json(result);

    } catch (error) {
       console.error('Error fetching artwork by artist ID:', error.message)
      return response.status(500).json({ error: 'Failed to fetch artwork' })
    }
  }

  async findByAdminId({ params, response }) {
    try {
        const adminId = params.id;

        const artworks = await Artwork.query().where('approved_by', adminId).fetch();
    
        if (artworks.rows.length === 0) {
          return response.status(404).json({ error: 'No artworks found for the given Admin ID' });
        }
    
        return response.json(artworks);
    } catch (error) {
       console.error('Error fetching artwork by admin ID:', error.message)
      return response.status(500).json({ error: 'Failed to fetch artwork' })
    }
  }

  async findByOwnerId({ params, response }) {
    try {
        const ownerId = params.id;

        const artworks = await Artwork.query().where('bought_by', ownerId).fetch();
    
        if (artworks.rows.length === 0) {
          return response.status(404).json({ error: 'No artworks found for the given owner ID' });
        }
    
        return response.json(artworks);
    } catch (error) {
       console.error('Error fetching artwork by owner ID:', error.message)
      return response.status(500).json({ error: 'Failed to fetch artwork' })
    }
  }

  async approve({ params, response }) {
    try {
      const artwork = await Artwork.find(params.id);
      const user = await User.find(artwork.artist_id);

      if (!user) {
        return response.status(404).json({ error: 'Artist not found' });
      }

      if (!artwork) {
        return response.status(404).json({ error: 'Artwork not found' });
      }

      artwork.stage = 2;
      artwork.bought_by = null;
      artwork.status = 'approved';

      const currentTime = new Date();
      artwork.bid_time = new Date(currentTime.getTime() + 5 * 60 * 1000);

      await artwork.save();

      const emailData = {
        artname: artwork.name,
        description: artwork.price,
        username: `${user.name} ${user.surname}`
      };
      await Mail.send('emails.approved', emailData, (message) => {
        message.from('no-reply@artizen.com');
        message.to(user.email)
        message.subject('Artwork Approval ')
      });

        return response.json({ message: 'Artwork approved successfully and email sent.' })
      } catch (error) {
        console.error('Error sending email:', error.message)
        return response.status(500).json({ error: 'Failed to send email' })
      }
  }

  async reject({ params, response }) {
    try {
      const artwork = await Artwork.find(params.id);
      const user = await User.find(artwork.artist_id);
        
      if (!user) {
        return response.status(404).json({ error: 'Artist not found' });
      }

      if (!artwork) {
        return response.status(404).json({ error: 'Artwork not found' });
      }

      artwork.stage = 1;
      artwork.bought_by = null;
      // artwork.status = 'rejected';

      await artwork.save();
      const emailData = {
        artname: artwork.name,
        description: artwork.price,
        username: `${user.name} ${user.surname}`
      };
      await Mail.send('emails.rejected', emailData, (message) => {
        message.from('no-reply@artizen.com');
        message.to(user.email)
        message.subject('Artwork Rejection Notice')
      });

      return response.json(artwork);
    } catch (error) {
      console.error('Error rejecting artwork:', error.message);
      return response.status(500).json({ error: 'Failed to rejecting artwork' });
    }
  }

  async buy({ params, request,  response }) {
    try {
      const artwork = await Artwork.find(params.id);
      const artist = await User.find(artwork.artist_id);
      // const buyer = await User.find(artwork.boug);
      const payment = new Payment();

      const belongsTo  = request.input(['bought_by']);
      const buyer = await User.find(artwork.belongsTo);

      if (!artwork) {
        return response.status(404).json({ error: 'Artwork not found' });
      }else if(!belongsTo){
        return response.status(500).json({ error: 'Buyer ID not found' });
      }

      payment.price = artwork.price;
      payment.artist_id = artwork.artist_id;
      payment.user_id = belongsTo;
      
      artwork.status = 'sold';
      artwork.stage = 5;
      artwork.bought_by = belongsTo;

      await artwork.save();
      await payment.save();

      const emailData = {
        artname: artwork.name,
        description: artwork.price,
        date_submitted: artwork.created_at.toDateString(),
        username: `${buyer.name} ${buyer.surname}`
      };
      
      await Mail.send('emails.buyerPayment', emailData, (message) => {
        message.from('no-reply@artizen.com');
        message.to(buyer.email)
        message.subject('Artwork Success Purchase')
      });

      
      return response.json({ message: 'Artwork purchased successfully' });
    } catch (error) {
      console.error('Error rejecting artwork:', error.message);
      return response.status(500).json({ error: 'Failed to purchased artwork' });
    }
  }

  async delete({ params, response }) {
    try {

      const artworkId = params.id;
      const artwork = await Artwork.find(artworkId);
  
      if (!artwork) {
        return response.status(404).json({ error: 'Artwork not found' });
      }
  
      const picturePath = Helpers.publicPath(`uploads/artworks/${artwork.picture}`);
  
      await artwork.delete();
      
      const fs = require('fs');
      if (fs.existsSync(picturePath)) {
        fs.unlinkSync(picturePath);
      }
  
      return response.status(200).json({ message: 'Artwork deleted successfully' });
    } catch (error) {
      console.error('Error deleting artwork:', error.message);
      return response.status(500).json({ error: 'Failed to delete artwork' });
    }
  }

  async store({ request, response }) {
    try {
      const artworkData = request.only(['name', 'price', 'artist_id']);

      const picture = request.file('picture', {
        types: ['image'],
        size: '5mb'
      })

      await picture.move(Helpers.publicPath('uploads/artworks'), {
        name: `${new Date().getTime()}.${picture.extname}`
      })

      if (!picture.moved()) {
        return picture.error();
      }

      artworkData.picture = picture.fileName;

       const picturePath = picture.fileName;
       const artwork = new Artwork();

        artwork.name = request.input('name');
        artwork.price = request.input('price');
        artwork.artist_id = request.input('artist_id');
        artwork.picture = picturePath;
        
        await artwork.save();

      return response.json(artwork);

    } catch (error) {
      console.error('Error creating artwork:', error.message)
      return response.status(500).json({ error: 'Failed to create artwork' })
    }
  }
  async image({ params, response }) {
    try {
      response.header('Access-Control-Allow-Origin', '*');
      response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
      response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

      const filePath = path.join(Helpers.publicPath('uploads/artworks'), params.fileName);

      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);

        response.header('Content-Type', 'image/png');
        response.header('Content-Disposition', `inline; filename="${params.fileName}"`);

        return response.send(fileBuffer);
      } else {
        return response.status(404).json({ error: 'Image not found' });
      }
    } catch (error) {
      console.error('Error retrieving image:', error.message);
      return response.status(500).json({ error: 'Failed to retrieve image' });
    }
  }

  async updateBidTimer({ params, response }) {
    try {
      const artwork = await Artwork.find(params.id);

      if (!artwork) {
        return response.status(404).json({ error: 'Artwork not found' });
      }

      if(artwork.bought_by == null) {
        artwork.stage = 3;

        const currentTime = new Date();
        artwork.bid_time = new Date(currentTime.getTime() + 5 * 60 * 1000);  
      } else {
        artwork.stage = 4;
      }


      await artwork.save();

      return response.json(artwork);
    } catch (error) {
      console.error('Error rejecting artwork:', error.message);
      return response.status(500).json({ error: 'Failed to rejecting artwork' });
    }
  }

  async update({ params, request,  response }) {
    try {
      const artwork = await Artwork.find(params.id); 
      const  belongsTo  = request.input(['bought_by']);
      const  price  = request.input(['price']);

      if (!artwork) {
        return response.status(404).json({ error: 'Artwork not found' });
      } else if(!belongsTo) {
        return response.status(500).json({ error: 'Buyer ID not found' });
      }
 
      artwork.bought_by = belongsTo;
      artwork.price = price;

      await artwork.save();

      return response.json({ message: 'Artwork purchased successfully' });
    } catch (error) {
      console.error('Error rejecting artwork:', error.message);
      return response.status(500).json({ error: 'Failed to purchased artwork' });
    }
  }
}

module.exports = ArtworkController
