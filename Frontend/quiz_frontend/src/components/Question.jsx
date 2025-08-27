export default function Question({ question, index, onAnswer, selectedOptions }) {
    const handleChange = (optionIdx) => {
      const newSelected = selectedOptions.includes(optionIdx)
        ? selectedOptions.filter(i => i !== optionIdx)
        : [...selectedOptions, optionIdx];
      onAnswer(index, newSelected);
    };
  
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold">{index + 1}. {question.text}</h3>
        {question.image && <img src={question.image} alt="question" className="my-2 max-w-xs" />}
        <div className="space-y-2">
          {question.options.map((opt, idx) => (
            <label key={idx} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedOptions.includes(idx)}
                onChange={() => handleChange(idx)}
                className="mr-2"
              />
              {opt.text}
            </label>
          ))}
        </div>
      </div>
    );
  }