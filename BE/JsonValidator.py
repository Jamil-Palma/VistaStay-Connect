from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI

# Definir el esquema JSON esperado usando Pydantic
class URLItem(BaseModel):
    title: str = Field(description="Title of the page")
    snippet: str = Field(description="Snippet of the page")
    link: str = Field(description="URL link of the page")

# Clase para validar y corregir JSON usando LangChain
class JsonValidator:
    def __init__(self):
        # Configuración del modelo y del parser
        self.model = ChatOpenAI(temperature=0)
        self.parser = JsonOutputParser(pydantic_object=URLItem)

    def validate_and_correct(self, raw_content):
        # Crear un prompt con instrucciones para devolver un JSON bien formado
        prompt = PromptTemplate(
            template="Convert the following malformed JSON into a valid JSON format.\n{format_instructions}\n{json_content}\n",
            input_variables=["json_content"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()},
        )

        # Ejecutar la cadena completa para validar y corregir el JSON
        chain = prompt | self.model | self.parser
        try:
            # Intenta corregir el JSON malformado
            corrected_data = chain.invoke({"json_content": raw_content})
            return corrected_data
        except Exception as e:
            print(f"Error al validar o corregir el JSON: {e}")
            return None
