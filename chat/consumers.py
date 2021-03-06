from channels import Group
from channels.sessions import channel_session
from .models import Room
import json

from . import utils

@channel_session
def ws_connect(message):

    # Gets room for message
    prefix, label = message['path'].strip('/').split('/')
    room = Room.objects.get(label=label)
    Group('chat-'+label).add(message.reply_channel)
    message.reply_channel.send({"accept":True})
    message.channel_session['room'] = room.label

@channel_session
def ws_receive(message):
    # Gets message from client, saves it in db, and broadcasts it to everyone
    label = message.channel_session['room']
    room = Room.objects.get(label=label)
    data = json.loads(message['text'])

    # error checks
    if len(data['handle'].strip()) == 0 or len(data['handle'].strip()) > 12:
        return
    if len(data['message'].strip()) == 0 or len(data['message'].strip()) > 1000:
        return

    m = room.messages.create(
        handle=data['handle'],
        handle_color=utils.fix_color(data['handle_color']),
        message=data['message'],
    )
    Group('chat-'+label).send({'text':json.dumps(m.as_dict())})

@channel_session
def ws_disconnect(message):
    # discard replay channel of user from room
    label = message.channel_session['room']
    Group('chat-'+label).discard(message.reply_channel)
