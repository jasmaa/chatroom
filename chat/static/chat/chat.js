var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
var chatsock = new ReconnectingWebSocket(ws_scheme + '://' + window.location.host + window.location.pathname);

// Formats chat message in table
chatsock.onmessage = function(message){
  var data = JSON.parse(message.data);

  // Sanitize
  var clean_handle = DOMPurify.sanitize(data.handle, {SAFE_FOR_TEMPLATES: true});
  var clean_message = DOMPurify.sanitize(data.message, {SAFE_FOR_TEMPLATES: true});

  if(clean_message == ""){
    clean_message = "<i>Message removed</i>"
  }

  $('#chat').prepend(
    '<tr>' +
    '<td><font color="green">' + clean_handle + ":</font> " + clean_message + '</td>'
    + '</tr>'
  );

  var table = document.getElementById('chat');
  var rowCount = table.rows.length;
  var msg = document.getElementById('message');
  // pop if greater than limit
  if(rowCount > 50){
    table.deleteRow(rowCount - 1);
  }

  // clear message
  document.getElementById("message").value = "";
};

// Sends data when form is submitted
$('#chatform').on('submit', function(event){
  var message = {
    handle: $('#handle').val(),
    message: $('#message').val(),
  }
  chatsock.send(JSON.stringify(message));
  return false;
});
