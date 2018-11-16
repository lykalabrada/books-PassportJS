///////////  SRC/SERVICES/CONTENT/INDEX.JS  //////////////////
'use strict'
import feathers from '@feathersjs/feathers'
import express from '@feathersjs/express'
import {content} from 'model/content'
import sanitize from 'mongo-sanitize'
import logger from '/utils/logger'

const app = express( feathers() )

const contentResponse = ( status, data, res ) => {
	res.status( status )
	res.send( JSON.stringify( data ) )
}

app.get( '/', async ( req, res ) => {
	try {
		const result = await content.find()
		contentResponse( 200, result, res )
	} catch ( e ) {
		contentResponse( 400, {error: 'error_retrieving_data'}, res )
		logger(e)
	}
})

app.get( '/:id', async ( req, res ) => {
	try {
		const result = await content.findById({_id: req.params.id})
		contentResponse( 200, result, res )
	} catch ( e ) {
		contentResponse( 400, {error: 'error_retrieving_data'}, res )
		logger(e)
	}
})

app.post( '/', async ( req, res ) => {
	const addContent = sanitize( req.body )
	try {
		const newContent = await content.create( addContent )
		contentResponse( 200, newContent, res )
	} catch ( e ) {
		contentResponse( 400, {error: 'error_saving_data'}, res )
		logger(e)
	}
})

app.put( '/:id', async ( req, res ) => {
	const updateContent = sanitize( req.body )
	const options = {new: true}
	try {
		const newContent = await content.findOneAndUpdate({_id: req.params.id}, updateContent, options )
		contentResponse( 200, newContent, res )
	} catch ( e ) {
		contentResponse( 400, {error: 'error_updating_data'}, res )
		logger(e)
	}
})

app.delete( '/:id', async ( req, res ) => {
	try {
		const result = await content.findById( req.params.id ).remove()
		contentResponse( 200, result, res )
	} catch ( e ) {
		contentResponse( 400, {error: 'error_deleting_data'}, res )
		logger(e)
	}
})

export default app





////////////   SRC/MODEL/CONTENT.JS   /////////////////////
'use strict'
import mongoose from 'mongoose'
import comfig from '../../config'
const {Schema} = mongoose

const schema = new Schema({
	title: {
		type     : String,
		required : true,
		unique   : 'content_already_exist',
		trim     : true,
		lowercase: true
	},
	content: {
		type: [{
			property: {type: String, trim: true},
			value   : {type: String, trim: true}
		}]
	}
})

export class ContentClass {
	static findByTitle ( title ) {
		return this.findOne({title}).exec()
	}
}

schema.loadClass( ContentClass )

export const content = mongoose.model( 'Contents', schema )




//////  SRC/TEST/CONTENT.TEST.JS  //////////
import 'babel-polyfill'
import {ContentClass} from 'model/content'

const CONTENT = {title  : 'welcome letter',
	content: [
    {property:"Language",value:"English"},
    {property:"main letter",value:"Welcome to Ducatus!"}
  ]
}

const mock = options => {
	class Content extends ContentClass {
		static findOne ( opts ) {
			const result = new Promise( ( resolve, reject ) => {
				resolve( options.findOne( opts ) )
			})
			result.exec = () => result
			return result
		}
		static create ( opts ) {
			const result = new Promise( ( resolve, reject ) => {
				resolve( options.create( opts ) )
			})
			result.exec = () => result
			return result
		}
	}
	return Content
}

test( 'resolves to Content when title is found', () => {
	const findOne = jest.fn()
	findOne.mockReturnValueOnce( CONTENT )

	const result = expect(
		mock({
			findOne
		}).findByTitle( CONTENT.title )
	).resolves.toEqual( CONTENT )

	expect( findOne.mock.calls.length ).toBe( 1 )
	expect( findOne.mock.calls[ 0 ].length ).toBe( 1 )
	expect( findOne.mock.calls[ 0 ][ 0 ] ).toEqual({
		title: 'welcome letter'
	})
	return result
})




////////////  SRC/MODEL/WHITEPAPER.JS  ////////////////////
'use strict'
import mongoose from 'mongoose'
import comfig from '../../config'
const {Schema} = mongoose

const schema = new Schema({
	fileTitle: {
		type     : String,
		required : true,
		unique   : 'file_already_exist',
		trim     : true,
		lowercase: true
	},
	fileInfo: new Schema({
		fileName: {
			type    : String,
			required: true,
  		trim    : true
		},
		fileURL: {
			type    : String,
			required: String,
  		trim    : true
		}
	})
})

export class WhitePaperClass {
	static findByfileTitle ( fileTitle ) {
		return this.findOne({fileTitle}).exec()
	}
}

schema.loadClass( WhitePaperClass )

export const whitePaper = mongoose.model( 'WhitePapers', schema )








//////////////////     COMPETITION DOCS     ////////////////////
/competition:
    post:
      summary: Admin - Create Competition
      tags:
        - Competitions
        - Admin
      security:
        - Authentication:
            - role
      consumes:
        - application/json
      parameters:
        - name: accessToken
          in: header
          required: true
          type: string
        - in: body
          name: competition
          schema:
            type: object
            required:
              - title
              - image
              - documentFile
              - date
            properties:
              title:
                type: string
              image:
                type: object
                properties:
                  fileName:
                    type: string
                  fileURL:
                    type: string
              documentFile:
                type: object
                properties:
                  fileName:
                    type: string
                  fileURL:
                    type: string
              countdownDate:
                type: string
              countdownTime:
                type: string
              date:
                type: string
      responses:
        '200':
          description: Success
        '400':
          description: Bad Request
        '401':
          description: Unauthorized
        '500':
          description: Internal Server Error
  '/competition/{competitionID}':
    put:
      summary: Update competition
      description: Updates competition details with specified ID.
      tags:
        - Competitions
        - Admin
      security:
        - Authentication:
            - role
      consumes:
        - application/json
      parameters:
        - name: accessToken
          in: header
          required: true
          type: string
        - name: competitionID
          in: path
          required: true
          type: integer
        - in: body
          name: competition
          schema:
            type: object
            required:
              - title
              - image
              - documentFile
            properties:
              title:
                type: string
              image:
                type: object
                properties:
                  fileName:
                    type: string
                  fileURL:
                    type: string
              documentFile:
                type: object
                properties:
                  fileName:
                    type: string
                  fileURL:
                    type: string
              countdownDate:
                type: string
              countdownTime:
                type: string
      responses:
        '200':
          description: Success
          schema:
            type: object
        '400':
          description: Bad Request
        '401':
          description: Unauthorized
        '500':
          description: Internal Server Error
    delete:
      summary: Admin - Delete Competition
      description: Deletes a competition with specified id
      tags:
        - Competitions
        - Admin
      security:
        - Authentication:
            - role
      parameters:
        - name: accessToken
          in: header
          required: true
          type: string
        - name: competitionID
          in: path
          required: true
          type: integer
      responses:
        '200':
          description: Success
        '400':
          description: Bad Request
        '401':
          description: Unauthorized
        '500':
          description: Internal Server Error
  '/competition/{limit}/{offset}':
    get:
      summary: Returns all competitions
      tags:
        - Competitions
      parameters:
        - name: accessToken
          in: header
          required: true
          type: string
        - name: limit
          in: path
          required: true
          type: integer
        - name: offset
          in: path
          required: true
          type: integer
      security:
        - Authentication:
            - role
      responses:
        '200':
          description: successful operation
          schema:
            type: object
            properties:
              totalCount:
                type: integer
              competitions:
                type: array
                items:
                  type: object
                  description: Competition information
                  properties:
                    id:
                      type: string
                    title:
                      type: string
                      description: Competition title
                    image:
                      type: object
                      properties:
                        fileName:
                          type: string
                        fileURL:
                          type: string
                    documentFile:
                      type: object
                      properties:
                        fileName:
                          type: string
                        fileURL:
                          type: string
                    countdownDate:
                      type: string
                    countdownTime:
                      type: string
                    date:
                      type: string
                      description: Competition date
        '400':
          description: Bad Request
        '401':
          description: Unauthorized
        '500':
          description: Internal Server Error




////////////////////    NEWS DOCS    ////////////////////////
'/news/':
    post:
      summary: Admin - Add News
      description: Allows admin to post news.
      tags:
        - News
        - CMS
        - Admin
      security:
        - Authentication:
            - role
      consumes:
        - application/json
      parameters:
        - name: accessToken
          in: header
          required: true
          type: string
        - in: body
          name: news
          schema:
            type: object
            required:
              - category
              - headline
              - newsDescription
              - newsImage
            properties:
              category:
                type: string
                description: 'Options: < info | pop up | marquee >'
                enum:
                  - info
                  - popup
                  - marquee
              headline:
                type: string
              newsDescription:
                type: string
              newsImage:
                type: object
                properties:
                  filename:
                    type: string
      responses:
        '200':
          description: Success
        '400':
          description: Bad Request
        '401':
          description: Unauthorized
        '500':
          description: Internal Server Error
  '/news/{category}/{limit}/{offset}':
    get:
      summary: Returns all News
      tags:
        - News
        - CMS
      security:
        - Authentication:
            - role
      parameters:
        - name: accessToken
          in: header
          required: true
          type: string
        - name: category
          in: path
          required: true
          type: string
          description: 'Options: < info | pop up | marquee >'
          enum:
            - info
            - popup
            - marquee
        - name: limit
          in: path
          required: true
          type: integer
        - name: offset
          in: path
          required: true
          type: integer
      responses:
        '200':
          description: Success
          schema:
            type: object
            properties:
              totalCount:
                type: integer
              news:
                type: array
                description: List of news
                items:
                  type: object
                  properties:
                    newsID:
                      type: string
                      description: News id number
                    category:
                      type: string
                      description: News category
                    headline:
                      type: string
                      description: News Headline
                    date:
                      type: string
                      description: Date news posted/added
                    newsDescription:
                      type: string
                      description: Content/description of news
                    newsLink:
                      type: string
                      description: Generated link for news
                    newsImage:
                      type: object
                      description: image filename/URL
                      properties:
                        filename:
                          type: string
                    newsStatus:
                      type: boolean
                      description: Current status of news
        '400':
          description: Bad Request
        '401':
          description: Unauthorized
        '500':
          description: Internal Server Error
  /news/{newsID}:
    put:
      summary: Admin - Update News
      description: Allows admin to update details of a news by specified ID.
      tags:
        - News
        - CMS
        - Admin
      security:
        - Authentication:
            - role
      consumes:
        - application/json
      parameters:
        - name: accessToken
          in: header
          required: true
          type: string
        - name: newsID
          in: path
          type: string
          required: true
        - in: body
          name: news
          schema:
            type: object
            required:
              - category
              - headline
              - newsDescription
              - newsStatus
            properties:
              category:
                type: string
                description: 'Options: < info | pop up | marquee >'
                enum:
                  - info
                  - popup
                  - marquee
              headline:
                type: string
              newsDescription:
                type: string
              newsImage:
                type: object
                properties:
                  filename:
                    type: string
              newsStatus:
                type: boolean
      responses:
        '200':
          description: Success
        '400':
          description: Bad Request
        '401':
          description: Unauthorized
        '500':
          description: Internal Server Error
    delete:
      summary: Admin - Delete News
      description: Allows admin to delete news by specified ID.
      tags:
        - News
        - CMS
        - Admin
      security:
        - Authentication:
            - role
      parameters:
        - name: accessToken
          in: header
          required: true
          type: string
        - name: newsID
          in: path
          type: string
          required: true
      responses:
        '200':
          description: Success
        '400':
          description: Bad Request
        '401':
          description: Unauthorized
        '500':
          description: Internal Server Error


////////////////////  COUNTRY SEARCH ORIGINAL  ////////////////////////////
'use strict'
import feathers from '@feathersjs/feathers'
import express from '@feathersjs/express'
import {country} from 'model/country'
import sanitize from 'mongo-sanitize'
import logger from 'utils/logger'

const app = express( feathers() )

app.get( '/:keyword/:limit/:offset', async ( req, res ) => {
	const {keyword, limit, offset} = req.params
	const regex = {'$regex': keyword,'$options': 'i'}
	try {
		const result = await country.find().or( [{'countryName': regex},{'countryCode': regex},{'phoneCode': regex},{'isoCode': regex}] ).limit( parseInt( limit ) ).skip( parseInt( offset ) )
		res.status( 200 ).send({result})
	} catch ( e ) {
		res.status( 400 ).send({error: e.message})
		logger( e )
	}
})

export default app







//////////////////   SERVICES/MCM-configuration      /////////////////////////////////////////////
'use strict'
import feathers from '@feathersjs/feathers'
import express from '@feathersjs/express'
import {mcmConfig} from 'model/mcmConfiguration'
import sanitize from 'mongo-sanitize'
import logger from 'utils/logger'

const app = express(feathers())

const mcmResponse = ( status, data, res ) => {
	res.status( status )
	res.send( JSON.stringify( data ) )
}

app.get('/',async ( req, res ) => {
	try {
		const result = await mcmConfig.find()
		mcmResponse( 200, result, res )
	} catch ( e ) {
		mcmResponse( 400, {error: 'error_retrieving_data'}, res )
		logger( e )
	}
})

app.post('/',async ( req, res ) => {
	const addMCMconfig = sanitize( req.body )
	try {
		const newMCMconfig = await mcmConfig.create( addMCMconfig )
		mcmResponse( 200, newMCMconfig, res )
	} catch ( e ) {
		mcmResponse( 400, {error: 'error_saving_data'}, res )
		logger( e )
	}
})

app.put('/:mcmConfigID',async ( req, res ) => {
	const updateMCMconfig = sanitize( req.body )
	const options = {new: true}
	try {
		const newMCMconfig = await mcmConfig.findOneAndUpdate({_id: req.params.mcmConfigID}, updateMCMconfig, options )
		mcmResponse( 200, newMCMconfig, res )
	} catch ( e ) {
		mcmResponse( 400, {error: 'error_updating_data'}, res )
		logger( e )
	}
})

app.delete('/:mcmConfigID',async ( req, res ) => {
	try {
		const result = await mcmConfig.findById( req.params.mcmConfigID ).remove()
		mcmResponse( 200, result, res )
	} catch ( e ) {
		mcmResponse( 400, {error: 'error_deleting_data'}, res )
		logger( e )
	}
})

export default app




////////////////////////  MODEL/mcmConfiguration  ///////////////////////////////////////////////
'use strict'
import mongoose from 'mongoose'
const {Schema} = mongoose

const schema = new Schema({
  startValue: {
    type: Number,
    required: true
  },
  endValue: {
    type: Number,
    required: true
  },
  valueOfCoin: {
    type: Number,
    required: true
  }
})

export class MCMconfigurationClass {}

schema.loadClass(MCMconfigurationClass)

export const mcmConfig = mongoose.model('MCMconfigurations')




////////////////////  SERVICES/INDEX.JS  ///////////////////////////
'use strict'
import session from './session'

import register from './user/register'
import verify from './user/verify'
import profile from './user/profile'
import suggest from './user/suggest'
import search from './user/search'
import validate from './user/validate'
import changePassword from './user/changePassword'

import resendVerification from './user/resendVerification'
import forgotPassword from './user/forgotPassword'

import roles from './roles'
import setRole from './roles/setRole'

import content from './content'
import whitepaper from './whitepaper'
import {authorizer} from 'utils/authorizer'
import tutorialsWebinars from './tutorials-webinars'
import bonusStatement from './bonus-statement'
import upload from './upload'
import rank from './rank'
import competition from './competition'
import promotion from './promotion'
import packageProduct from './package'
import sponsorRegion from './sponsor-region'
import event from './event'
import news from './news'
import businessplan from './business-plan'
import country from './country'
import countrysearch from './country/search'
import mcmConfig from './mcm-configuration'

export default  ( app ) => {
	app.get( '/', async ( req, res ) => {
  	const response = {
  		 company: 'ducatus',
  		 version: '2.0.1',
  		 message: 'welcome'
  	}
  	res.status( 200 )
		res.send( JSON.stringify( response ) )
	})

	app.use( '/register', register )
	app.use( '/verify', verify )
	app.use( '/resend-verification', resendVerification )
	app.use( '/session', session )
	app.use( '/forgot-password', forgotPassword )

	app.use( '/upload',authorizer(), upload )
	app.use( '/profile', authorizer(), profile )
	app.use( '/suggest', authorizer(), suggest )
	app.use( '/search', authorizer(), search )
	app.use( '/validate', authorizer(), validate )
	app.use( '/change-password', authorizer(), changePassword )

	app.use( '/content', authorizer( ['tools', 'contentManagement'] ), content )
	app.use( '/whitepaper', authorizer( ['tools', 'whitePaper'] ), whitepaper )

	app.use( '/roles',authorizer( ['settings', 'addUserRoles'] ), roles )
	app.use( '/set-role',authorizer( ['memberManagement', 'setUserRole'] ), setRole )

	app.use( '/tutorials-and-webinars', authorizer( ['tutorialsAndWebinars'] ), tutorialsWebinars )
	app.use( '/rank', authorizer( ['careerRank'] ), rank )
	app.use( '/competition', authorizer( ['competition'] ), competition )
	app.use( '/sponsor-region', authorizer( ['sponsorRegion'] ), sponsorRegion )
	app.use( '/news', authorizer( ['communication', 'newsAndInfo'] ), news )

	app.use( '/promotion', authorizer( ['tools','promotionManagement'] ), promotion )
	app.use( '/event', authorizer( ['tools','events'] ), event )
	app.use( '/business-plan', authorizer( ['tools','uploadBusinessPlan'] ), businessplan )
	app.use('/mcm-configuration', mcmConfig)

	app.use( '/country', authorizer( ['settings','countrySettings'] ), country )
	app.use( '/country/search', authorizer( ['settings','countrySettings'] ), countrysearch )

	for ( let bonusCategory of ['directBonus', 'teamBonus', 'fastStartBonus', 'matchingBonus', 'rankBonus'] ) {
		app.use( '/bonus-statement', authorizer( ['bonusStatement',bonusCategory] ), bonusStatement )
	}

	for ( let packageManagement of ['addPackage', 'updateUserPackage'] ) {
		app.use( '/package', authorizer( ['packageManagement',packageManagement] ), packageProduct )
	}
}
