$(function() {

  $("#form1").alpaca({
    "schemaSource": "/public/schema.json",
    "options": {
      "form": {
        "buttons": {
          "submit": {
            "title": "Generate",
            "click": function() {
              var val = JSON.stringify(this.getValue());

              $('#result').val(JSON.stringify(this.getValue(), null, 2));

              var emailHref = $('#buttonSendAsEmail').attr('href');

              $('#buttonSendAsEmail').attr('href', emailHref + "?body=" + val);
            }
          }
        }
      }
    },
    "postRender": function(c) {
      var pl = localStorage.getItem('payload');

      if (pl) {
        pl = JSON.parse(pl);
        c.setValue(pl);
      }

      // Run setValue again after 200ms to array render error
      // More info: https://github.com/gitana/alpaca/issues/356
      setTimeout(function() {
        c.setValue(pl);
      }, 200);
    }
  });




  $('body').on('keyup', 'input', function(e) {
    var payload = $("#form1").alpaca("get").getValue();
    localStorage.setItem('payload', JSON.stringify(payload));
  });

  $('#buttonStartAgain').click(function(e) {
    e.preventDefault();

    if (confirm("Are you sure?")) {
      localStorage.removeItem('payload');
      location.reload();
    }

  });
});
