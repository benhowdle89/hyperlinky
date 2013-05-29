LinksCollection = new Meteor.Collection("Links");

if (Meteor.isClient) {

  Template.links.links = function() {
    if (!Meteor.loggingIn()) {
      var defaults = [{
          name: 'twitter',
          location: 0,
          hidden: false
        }, {
          name: 'dribbble',
          location: 1,
          hidden: false
        }, {
          name: 'medium',
          location: 2,
          hidden: false
        }
      ];
      var l = LinksCollection.findOne({
        userId: Meteor.userId()
      });
      var userLinks = (l && l.links) ? l.links : [];

      function sortByKey(array, key) {
        return array.sort(function(a, b) {
          var x = a[key];
          var y = b[key];
          return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
      }

      return sortByKey(_.extend(defaults, userLinks), 'location');
    }
  };

  Template.links.linksId = function() {
    if (!Meteor.loggingIn()) {
      var l = LinksCollection.findOne({
        userId: Meteor.userId()
      });
      if (l) {
        return l._id;
      }
    }
  };

  Template.links.rendered = function() {
    var linksList = document.querySelector('#links');
    var links = linksList.querySelectorAll('li');
    var each = Array.prototype.forEach;

    var toggleOpacity = function(e) {
      var cl = e.currentTarget.classList;
      if (cl.contains('dead')) {
        cl.remove('dead');
      } else {
        cl.add('dead');
      }
    };

    each.call(links, function(link) {
      link.addEventListener('click', toggleOpacity, false);
    });

    $('#links').sortable({
      update: function(event, ui) {
        var linksArr = [];
        var nodeList = Array.prototype.slice.call(document.querySelectorAll('#links li'));
        each.call(links, function(link) {
          linksArr.push({
            name: link.getAttribute('data-name'),
            location: nodeList.indexOf(link),
            hidden: !! (link.classList.contains('dead'))
          });
        });

        var id = linksList.getAttribute('data-id');
        if (id) {
          Meteor.saveLinks({
            _id: id
          }, {
            'links': linksArr
          });
        } else {
          Meteor.createLinks({
            userId: Meteor.userId(),
            links: linksArr
          });
        }
      }
    });
  };

  Meteor.createLinks = function(content) {
    LinksCollection.insert(content, function(err, id) {

    });
  };

  Meteor.saveLinks = function(conditions, content) {
    LinksCollection.update(conditions, {
      $set: content
    });
  };

  Meteor.autorun(function() {
    Meteor.subscribe("Links");
  });

}

if (Meteor.isServer) {
  Meteor.publish("Links", function() {
    return LinksCollection.find();
  });

  // LinksCollection.allow({
  //   'insert': function(userId, doc) {
  //     if (userId) {
  //       return true;
  //     }
  //   },
  //   'update': function(userId, doc) {
  //     if (userId == doc.userId) {
  //       return true;
  //     }
  //   },
  //   'remove': function(userId, doc) {
  //     if (userId == doc.userId) {
  //       return true;
  //     }
  //   }
  // });

}