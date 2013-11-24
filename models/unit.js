function Unit() {
  this.model = 'Unit';
};

module.exports = Unit;

Unit.isEmpty = function isEmpty(obj) {
  if(isSet(obj)) {
      if (obj.length && obj.length > 0) { 
          return false;
      }

      for (var key in obj) {
          if (hasOwnProperty.call(obj, key)) {
              return false;
          }
      }
  }
  return true;    
};

function isSet(val) {
  if ((val != undefined) && (val != null)){
      return true;
  }
  return false;
};