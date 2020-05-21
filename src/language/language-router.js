const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const jsonBodyParser = express.json();

const languageRouter = express.Router()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    try{
      const nextWord = await LanguageService.getNextWord(
        req.app.get('db'),
        req.language.id
      )
      console.log(nextWord);
      res.json({
        nextWord: nextWord.original,
        totalScore: req.language.total_score,
        wordCorrectCount: nextWord.correct_count ,
        wordIncorrectCount: nextWord.incorrect_count,
      })
      next()
    }catch(error){
      next(error)
    }
    // res.send('implement me!')
  })

languageRouter
  .use(requireAuth)
  .route('/guess')
  .post(jsonBodyParser, async (req, res, next) => {
   const guess = req.body.guess;
    if(!guess){
      return res.status(400).send({error: "Missing 'guess' in req.body"})
    }
    try{
    const guess= await LanguageService.getLanguageWords()(
      req.app.get('db'),
    )
    let list=await LanguageService.createLinkedList(words)
    }
    // res.send('implement me!')
  })

module.exports = languageRouter
