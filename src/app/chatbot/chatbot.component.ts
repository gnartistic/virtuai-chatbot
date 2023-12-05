import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { lastValueFrom } from 'rxjs';



interface ApiKeyResponse {
  apiKey: string;
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit {
  messages: ChatMessage[] = [];
  userInput: string = '';
  apiUrl = 'https://api.openai.com/v1/chat/completions';
  backendUrl = '/api/getApiKey.js'; // URL to your backend endpoint

  // Add loading and error variables
  loading: boolean = false;
  error: string | null = null;

  formattedResponse: SafeHtml = '';
  customErrorMessage: string | null = null;

  isLoading: boolean = false;
  errorOccurred: boolean = false;

  constructor(private http: HttpClient, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.messages.push({ text: 'What the fuck do you want?', user: false });
  }

  async getApiKey(): Promise<string> {
    try {
      // Define headers within the method scope
      const headers = new HttpHeaders({
        Authorization: `Bearer ${environment.authToken}`
      });

      const response = this.http.post<ApiKeyResponse>(this.backendUrl, {}, { headers });
      return (await lastValueFrom(response)).apiKey;
    } catch (error) {
      console.error('Error fetching API key:', error);
      return '';
    }
  }


  async sendMessage() {
    if (this.userInput.trim() === '') return;

    this.messages.push({ text: this.userInput, user: true });

    const userMessage = this.userInput;
    const apiKey = await this.getApiKey(); // Retrieve the API key from the backend

    if (!apiKey) {
      this.handleError('Failed to retrieve API key.');
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    });

    const conversation = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: userMessage },
    ];

    this.isLoading = true;
    this.errorOccurred = false;
    this.customErrorMessage = '';

    try {
      const response = await this.http.post(this.apiUrl, { model: 'gpt-4', messages: conversation }, { headers }).toPromise();

      if (response && 'choices' in response) {
        const apiResponse: ApiResponse = response as ApiResponse;
        const botResponse = apiResponse.choices[0].message.content.trim();

        // Push the bot's response to the messages array
        this.messages.push({ text: botResponse, user: false });

        // Format and set the response
        this.formattedResponse = this.formatCodeBlock(botResponse);
      } else {
        this.handleError("Invalid or empty response from the API.");
      }
    } catch (error) {
      this.handleError("I'm experiencing technical difficulties at the moment. Please try again later.");
      console.error(error);
    } finally {
      this.isLoading = false;
    }
    this.userInput = ''; // Clear the input field
  }

  handleError(errorMessage: string): void {
    this.customErrorMessage = errorMessage;
    this.errorOccurred = true; // Set error flag to true
  }

  formatCodeBlock(code: string): SafeHtml {
    const formattedCode = this.sanitizer.bypassSecurityTrustHtml(`<pre><code>${code}</code></pre>`);
    return formattedCode;
  }
}
// Define the ApiResponse type based on the expected structure
interface ApiResponse {
  choices: { message: { content: string } }[];
}

interface ChatMessage {
  text: string;
  user: boolean;
}

