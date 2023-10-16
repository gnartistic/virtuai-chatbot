import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {
  messages: ChatMessage[] = [];
  userInput: string = '';
  apiUrl = 'https://api.openai.com/v1/chat/completions';
  apiKey = environment.openaiApiKey;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.messages.push({ text: 'Hello! How can I assist you today?', user: false });
  }

  async sendMessage() {
    if (this.userInput.trim() === '') return;

    this.messages.push({ text: this.userInput, user: true });

    const userMessage = this.userInput;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    });

    const conversation = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: userMessage },
    ];

    interface ApiResponse {
      choices: { message: { content: string } }[];
    }

    try {
      const response = await this.http.post(this.apiUrl, { model: 'gpt-4', messages: conversation }, { headers }).toPromise();

      if (response && 'choices' in response) {
        const apiResponse: ApiResponse = response as ApiResponse; // Type assertion

        // Get the assistant's response
        const botResponse = apiResponse.choices[0].message.content.trim();
        this.messages.push({ text: botResponse, user: false });
      } else {
        console.error('Invalid or empty response from the API.');
      }
    } catch (error) {
      console.error(error);
    }

    this.userInput = '';
  }
}

interface ChatMessage {
  text: string;
  user: boolean;
}
