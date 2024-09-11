# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    user_list = []

    
    async def connect(self):
        # Called when the WebSocket is handshaking as part of the connection
        print("calling connect mwthod")
        room_id = "video_call"
  
        self.room_group_name = f'chat_{room_id}'
        print( self.channel_name)
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()  # Accept the WebSocket connection

    async def disconnect(self, close_code):
        # Called when the WebSocket closes for any reason
        print("inside disconnect")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
 

    async def receive(self, text_data):
        # Receive message from WebSocket
        print(text_data, "this is from client")
   
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message', '')
      
        from_user = text_data_json.get('from', '')
     
        if (text_data_json['type'] == "chat_message"):
            # Send the message to the room group
            await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'chat_message',
                            'message': message,
                            "from_user" : from_user,
                  
                        }
                )



        

        elif (text_data_json['type'] == "offer"):

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                            'type': 'offer',
                            'message': message,
                             "from_user" : from_user,
                       

                }
            )
        elif (text_data_json['type'] == "answer"):
             await self.channel_layer.group_send(
                self.room_group_name,
                {
                            'type': 'answer',
                            'message': message,
                                "from_user" : from_user,
                         

                }
            )
             
        elif (text_data_json['type'] == "ice-candidate"):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'ice_candidate',
                    'message': message,
                       "from_user" : from_user,
                }
                )
            
            
        elif (text_data_json['type'] == "new_user_joined"):
             await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'new_user_joined',
                            'message': message,
                       
                  
                        }
                )
    


    async def new_user_joined(self, event):
            user = event['message']
            if user not in self.user_list: 
                self.user_list.append(user)
                print("user appended in list", self.user_list)
            await self.send(
                 text_data=json.dumps(  {
                    "type":'new_user_joined',
                        'message': self.user_list

                })
              
            )




             
    async def ice_candidate(self, event):
            from_user  = event["from_user"]
            
            candidate = event['message']
     
            print("event -------------", event)

            await self.send(
                text_data=json.dumps(
                    {
                        "type": "ice-candidate",
                        "message": candidate,
                           "from_user" : from_user,
                  

                    }
                )
                )
            

   



    async def answer(self, event):
        from_user  = event["from_user"]
        answer = event['message']
 
        print("inside answer --------------- event receive " )
        

        await self.send(
            text_data = json.dumps(
                 { "type" : 'answer',
                    "message" : answer,
                           "from_user"  :from_user
                   
                    }
            )
        )



    async def offer(self, event):
        # print(event, " ---- offer handler ")
        from_user  = event["from_user"]
        offer = event['message']
        print(" --------------------------------------------------------", offer)
    
        await self.send(
            text_data = json.dumps(
                { "type" : 'offer',
                    "message" : offer,
                         "from_user" :from_user
                    
                        }
                )
            )

    async def chat_message(self, event):
        # Called when a message is received from the room group
        message = event['message']
        # message["message"]["user"] = self.channel_name
        print(message, " ---------------------------------------")
        

        # Send the message to the WebSocket
        await self.send(text_data=json.dumps({
            'message': message
        }))

