
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Livechat Client' });
};

exports.service = function(req, res) {
  res.render('service', { title: 'Livechat Service' })
}