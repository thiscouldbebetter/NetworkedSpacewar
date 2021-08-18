
class SerializerNode
{
	constructor(objectWrapped)
	{
		this.objectWrappedTypeName = null;
		this.id = null;
		this.isReference = null;

		this.objectWrapped = objectWrapped;
	}

	wrap
	(
		objectsAlreadyWrapped, objectIndexToNodeLookup
	)
	{
		if (this.objectWrapped != null)
		{
			var typeName = this.objectWrapped.constructor.name;

			var objectIndexExisting =
				objectsAlreadyWrapped.indexOf(this.objectWrapped);

			if (objectIndexExisting >= 0)
			{
				var nodeForObjectExisting = objectIndexToNodeLookup[objectIndexExisting];
				this.id = nodeForObjectExisting.id;
				this.isReference = true;
				this.objectWrapped = null;
			}
			else
			{
				this.isReference = false;
				var objectIndex = objectsAlreadyWrapped.length;
				this.id = objectIndex;
				objectsAlreadyWrapped.push(this.objectWrapped);
				objectIndexToNodeLookup[objectIndex] = this;

				this.objectWrappedTypeName = typeName;

				if (typeName == Function.name)
				{
					this.objectWrapped = this.objectWrapped.toString();
				}
				else
				{
					this.children = {};

					for (var propertyName in this.objectWrapped)
					{
						if (this.objectWrapped.__proto__[propertyName] == null)
						{
							var propertyValue = this.objectWrapped[propertyName];

							if (propertyValue == null)
							{
								child = null;
							}
							else
							{
								var propertyValueTypeName = propertyValue.constructor.name;

								if
								(
									propertyValueTypeName == Boolean.name
									|| propertyValueTypeName == Number.name
									|| propertyValueTypeName == String.name
								)
								{
									child = propertyValue;
								}
								else
								{
									child = new SerializerNode
									(
										propertyValue
									);
								}

							}

							this.children[propertyName] = child;
						}
					}

					delete this.objectWrapped;

					for (var childName in this.children)
					{
						var child = this.children[childName];
						if (child != null)
						{
							var childTypeName = child.constructor.name;
							if (childTypeName == SerializerNode.name)
							{
								child.wrap
								(
									objectsAlreadyWrapped,
									objectIndexToNodeLookup
								);
							}
						}
					}
				}
			}

		} // end if objectWrapped != null

		return this;

	} // end method

	prototypesAssign()
	{
		if (this.children != null)
		{
			for (var childName in this.children)
			{
				var child = this.children[childName];
				if (child != null)
				{
					var childTypeName = child.constructor.name;
					if (childTypeName == Object.name)
					{
						child.__proto__ = SerializerNode.prototype;
						child.prototypesAssign();
					}
				}
			}
		}
	}

	unwrap(nodesAlreadyProcessed)
	{
		if (this.isReference)
		{
			var nodeExisting = nodesAlreadyProcessed[this.id];
			this.objectWrapped = nodeExisting.objectWrapped;
		}
		else
		{
			nodesAlreadyProcessed[this.id] = this;
			var typeName = this.objectWrappedTypeName;
			if (typeName == null)
			{
				// Value is null.  Do nothing.
			}
			else if (typeName == Array.name)
			{
				this.objectWrapped = [];
			}
			else if (typeName == Map.name)
			{
				this.objectWrapped = new Map();
			}
			else if (typeName == Function.name)
			{
				var functionCode = this.objectWrapped;

				// Fix methods and "big arrow" functions so eval() works on them.

				var functionKeyword = "function";
				if (functionCode.indexOf(functionKeyword) != 0)
				{
					functionCode = functionKeyword + " " + functionCode;
				}

				var bigArrowKeyword = "=>"; // Alternate syntax for functions.
				if (functionCode.indexOf(bigArrowKeyword) >= 0)
				{
					functionCode =
						functionCode.split(bigArrowKeyword).join("");
				}
				
				this.objectWrapped = eval("(" + functionCode + ")");
			}
			else if
			(
				typeName == Boolean.name
				|| typeName == Number.name
				|| typeName == String.name
			)
			{
				// Primitive types. Do nothing.
			}
			else
			{
				this.objectWrapped = {};
				var objectWrappedType = eval("(" + typeName + ")");
				this.objectWrapped.__proto__ = objectWrappedType.prototype;
			}

			if (this.children != null)
			{
				for (var childName in this.children)
				{
					var child = this.children[childName];

					if (child != null)
					{
						if (child.constructor.name == SerializerNode.name)
						{
							child = child.unwrap
							(
								nodesAlreadyProcessed
							);
						}
					}

					this.objectWrapped[childName] = child;
				}
			}

		}

		return this.objectWrapped;
	}
}
