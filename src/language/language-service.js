const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },
  getNextWord(db, language_id){
    return db
    .from('word')
    .join('language', 'word.id', 'language.head')
    .select('word.original','word.language_id','word.correct_count', 'word.incorrect_count', 'language.total_score')
    .where({ language_id }).first()

  }
  getCurrentWord(){
    
  }

  //get word object to compare guess


  // }
  // trackScore(){

  // }
}

module.exports = LanguageService
